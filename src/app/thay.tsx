/**
 * Màn làm việc của thầy: mọi đơn khách gửi tới.
 *
 * Thầy KHÔNG đi qua luồng nhập hồ sơ của khách — không tên, không ngày sinh,
 * không cung. Màn gốc nhận ra tư cách thầy rồi đưa thẳng vào đây.
 *
 * Việc lọc "đơn của ai" do luật khoá dòng dưới máy chủ lo, không phải do màn
 * này. Lọc ở máy khách là thứ ai cũng gỡ được.
 *
 * Sắp xếp và tìm kiếm chạy ngay trên máy, không hỏi lại máy chủ. Một thầy có
 * vài chục đơn là cùng; bắn một lượt gọi cho mỗi ký tự gõ vào ô tìm thì vừa
 * chậm vừa tốn, mà kết quả không khá hơn.
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { CHU, MAU } from '@/constants/giao-dien';
import { tachNgay } from '@/lib/ho-so';
import { dongGoi } from '@/lib/goi';
import { duongLienHe, ngayDoc, useHoSoKhach } from '@/lib/khach';
import { cungTheoNgay, timCung } from '@/lib/zodiac';
import { supabase } from '@/lib/supabase';
import { useLaThay } from '@/lib/thay';
import { daCoQuyen, dangKyMaDay, goMaDay, xinQuyen } from '@/lib/thong-bao';
import {
  ngayHenGon,
  TEN_TRANG_THAI,
  thayDoiTrangThai,
  useDonChoThay,
  type YeuCau,
} from '@/lib/yeu-cau';

const MAU_TRANG_THAI = { cho: MAU.vang, xong: MAU.tot, huy: MAU.chuMo } as const;

/** Lý do từ chối ngắn nhất chấp nhận được. Dưới mức này thì chưa nói được gì. */
const TOI_THIEU_LY_DO = 5;

type Xep = 'moi' | 'cu' | 'ten';
const TEN_XEP: Record<Xep, string> = {
  moi: 'Mới nhất',
  cu: 'Cũ nhất',
  ten: 'Theo tên khách',
};

/** Ngày dạng 14/10, dùng cả để hiện lẫn để tìm. */
function ngayGon(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function ManThay() {
  const { thay, xong } = useLaThay();
  const { dong, loi, dangTai, lamMoi } = useDonChoThay();
  const [coQuyen, datCoQuyen] = useState<boolean | null>(null);
  /**
   * Máy chủ đã biết máy này chưa.
   *
   * Khác với `coQuyen`: cấp quyền rồi mà lệnh ghi mã máy hỏng thì vẫn không
   * nhận được tin nào. Phải tách hai thứ, không thì hỏng ở bước hai mà màn hình
   * báo mọi thứ bình thường.
   */
  const [daSanSang, datDaSanSang] = useState<boolean | null>(null);
  const [dangXin, datDangXin] = useState(false);
  const [xep, datXep] = useState<Xep>('moi');
  const [tim, datTim] = useState('');
  const [dangTuChoi, datDangTuChoi] = useState<YeuCau | null>(null);
  const [lyDo, datLyDo] = useState('');

  useFocusEffect(
    useCallback(() => {
      daCoQuyen()
        .then((co) => {
          datCoQuyen(co);
          // Ghi lại mã máy MỖI LẦN mở màn, không chỉ lúc đăng nhập.
          //
          // Lúc đăng nhập mà mạng chập là lệnh ghi hỏng, và trước đây không có
          // đường nào thử lại: nút "Bật thông báo" chỉ hiện khi CHƯA có quyền,
          // mà quyền thì đã cấp rồi. Thầy thấy mọi thứ bình thường, chỉ là
          // không bao giờ nhận được tin nào.
          //
          // Ghi đè theo mã máy nên gọi lại nhiều lần không sinh dòng thừa.
          if (co) {
            dangKyMaDay()
              .then((ma) => datDaSanSang(Boolean(ma)))
              .catch(() => datDaSanSang(false));
          } else {
            datDaSanSang(false);
          }
        })
        .catch(() => datCoQuyen(false));
      lamMoi();
    }, [lamMoi])
  );

  const ds = useMemo(() => {
    const chu = tim.trim().toLowerCase();
    let ra = [...(dong ?? [])];

    if (chu) {
      // Tìm theo cả hai tiêu chí cùng lúc: gõ "Đào" ra đơn của khách tên Đào,
      // gõ "14/10" ra đơn đặt hôm đó. Không bắt khách chọn trước tìm theo gì —
      // bắt chọn là thêm một bước mà máy tự đoán được.
      ra = ra.filter(
        (y) =>
          (y.ten_khach ?? '').toLowerCase().includes(chu) ||
          ngayGon(y.tao_luc).includes(chu) ||
          // Cả ngày HỌN, không chỉ ngày đặt. Thầy gõ '20/10' là đang tìm buổi hẹn
          // hôm đó, chứ không phải tìm đơn nào đặt hôm đó — hai thứ này thường
          // lệch nhau cả tuần.
          (ngayHenGon(y.ngay_hen) ?? '').includes(chu) ||
          y.chu_de.toLowerCase().includes(chu)
      );
    }

    ra.sort((a, b) => {
      if (xep === 'ten') {
        // localeCompare tiếng Việt, không so chuỗi thô: bảng mã thô cho ra Đ
        // đứng sau Z nên "Đào" rơi xuống tận cuối.
        const c = (a.ten_khach ?? '').localeCompare(b.ten_khach ?? '', 'vi');
        if (c !== 0) return c;
      }
      const t = a.tao_luc.localeCompare(b.tao_luc);
      return xep === 'cu' ? t : -t;
    });
    return ra;
  }, [dong, tim, xep]);

  async function bat() {
    datDangXin(true);
    try {
      const duoc = await xinQuyen();
      datCoQuyen(duoc);
      if (duoc) datDaSanSang(Boolean(await dangKyMaDay()));
      else
        Alert.alert(
          'Máy đang chặn thông báo',
          'Hộp thoại xin quyền của hệ điều hành chỉ hiện một lần. Vào phần cài đặt của máy, tìm Omora rồi bật thông báo giúp tôi.'
        );
    } finally {
      datDangXin(false);
    }
  }

  function doi(yc: YeuCau, sang: 'da_nhan' | 'da_xong' | 'da_huy', hoi: string) {
    Alert.alert(hoi, `Khách sẽ thấy trạng thái mới trong app.`, [
      { text: 'Thôi', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: () =>
          thayDoiTrangThai(yc.ma, sang)
            .then(lamMoi)
            .catch(() => Alert.alert('Chưa đổi được', 'Kiểm tra mạng rồi thử lại giúp tôi.')),
      },
    ]);
  }

  /**
   * Từ chối thì PHẢI viết lý do.
   *
   * Khách chỉ thấy chữ "đã huỷ" mà không biết vì sao là họ tự đoán, mà đoán thì
   * thường đoán xấu. Một câu của thầy giữ được quan hệ, và khách còn biết nên
   * đặt lại hay thôi.
   *
   * Dựng hộp nhập riêng chứ KHÔNG dùng Alert.prompt: hàm đó chỉ có trên iOS,
   * gọi trên Android là không hiện gì và nút từ chối thành nút chết.
   */
  function tuChoi(yc: YeuCau) {
    datLyDo('');
    datDangTuChoi(yc);
  }

  function guiTuChoi() {
    const yc = dangTuChoi;
    if (!yc || lyDo.trim().length < TOI_THIEU_LY_DO) return;
    datDangTuChoi(null);
    thayDoiTrangThai(yc.ma, 'da_huy', lyDo)
      .then(lamMoi)
      .catch(() => Alert.alert('Chưa gửi được', 'Kiểm tra mạng rồi thử lại giúp tôi.'));
  }

  function thoat() {
    Alert.alert('Đăng xuất?', 'Bạn sẽ không nhận được thông báo đơn mới nữa.', [
      { text: 'Ở lại', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () =>
          // Gỡ máy TRƯỚC khi đăng xuất: xoá dòng của mình cần thẻ còn hiệu lực.
          // Thiếu bước này thì đăng xuất xong máy vẫn rung mỗi khi có đơn mới.
          goMaDay()
            .then(() => supabase.auth.signOut())
            .then(() => router.replace('/dang-nhap'))
            .catch(() => Alert.alert('Chưa đăng xuất được', 'Kiểm tra mạng rồi thử lại.')),
      },
    ]);
  }

  if (!xong) {
    return (
      <ManHinh tieuDe="Chuyên gia">
        <DangTai />
      </ManHinh>
    );
  }

  if (!thay) {
    return (
      <ManHinh tieuDe="Chuyên gia">
        <Khoi>
          <ChuThan>
            Tài khoản này chưa được cấp quyền chuyên gia. Liên hệ người phụ trách Omora giúp tôi.
          </ChuThan>
        </Khoi>
        <View className="mt-6">
          <Nut nhan="Về màn đăng nhập" kieu="vien" onPress={() => router.replace('/dang-nhap')} />
        </View>
      </ManHinh>
    );
  }

  const coDon = (dong?.length ?? 0) > 0;

  return (
    <ManHinh
      tieuDe="Đơn của bạn"
      phu={`Đang làm việc với tư cách ${thay.ten}`}
      onLamMoi={lamMoi}
      dangLamMoi={dangTai && coDon}>
      {/* Ba trạng thái, không phải hai. Cấp quyền rồi mà máy chủ chưa biết máy
          này thì vẫn không nhận được tin — trước đây chỗ đó hiện màn sạch trơn,
          thầy tưởng xong. */}
      {coQuyen === false ? (
        <View className="mb-6">
          <Khoi vang>
            <View className="mb-2 flex-row items-center gap-2.5">
              <Ionicons name="notifications-off-outline" size={18} color={MAU.canh} />
              <Text
                style={{ fontFamily: CHU.thanDam, letterSpacing: 1.4, color: MAU.canh }}
                className="text-[11px] uppercase">
                Thông báo đang tắt
              </Text>
            </View>
            <ChuThan>
              Chưa bật thì có đơn mới bạn phải tự vào đây xem. Bật lên thì máy báo ngay.
            </ChuThan>
            <View className="mt-5">
              <Nut nhan="Bật thông báo" dangChay={dangXin} onPress={bat} />
            </View>
          </Khoi>
        </View>
      ) : daSanSang === false ? (
        <View className="mb-6">
          <Khoi vang>
            <View className="mb-2 flex-row items-center gap-2.5">
              <Ionicons name="warning-outline" size={18} color={MAU.canh} />
              <Text
                style={{ fontFamily: CHU.thanDam, letterSpacing: 1.4, color: MAU.canh }}
                className="text-[11px] uppercase">
                Chưa nối được với máy chủ
              </Text>
            </View>
            <ChuThan>
              Máy bạn đã cho phép thông báo, nhưng máy chủ chưa ghi nhận được máy này nên
              chưa đẩy tin về đây. Thường là do mạng. Kéo màn xuống để thử lại.
            </ChuThan>
            <View className="mt-5">
              <Nut nhan="Thử nối lại" kieu="vien" dangChay={dangXin} onPress={bat} />
            </View>
          </Khoi>
        </View>
      ) : daSanSang === true ? (
        <View className="mb-6 flex-row items-center justify-center gap-2">
          <Ionicons name="checkmark-circle" size={15} color={MAU.tot} />
          <Text style={{ fontFamily: CHU.than, color: MAU.tot }} className="text-xs">
            Thông báo đang bật, máy sẽ báo khi có đơn mới
          </Text>
        </View>
      ) : null}

      {dangTai ? <DangTai /> : null}

      {loi ? (
        <View>
          <Trong loi={`Chưa tải được danh sách. ${loi}`} />
          <View className="mt-5">
            <Nut nhan="Thử lại" kieu="vien" onPress={lamMoi} />
          </View>
        </View>
      ) : null}

      {dong && !coDon ? (
        <Trong loi="Chưa có ai đặt lịch. Có đơn mới là máy báo cho bạn ngay." />
      ) : null}

      {coDon ? (
        <View>
          <TextInput
            value={tim}
            onChangeText={datTim}
            placeholder="Tên khách, ngày hẹn, hoặc chủ đề"
            placeholderTextColor={MAU.chuMo}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ fontFamily: CHU.than, color: MAU.chuChinh, borderColor: MAU.vien }}
            className="rounded-xl border bg-nen-nhat px-4 py-3 text-base"
          />

          {/* Chỉ hiện khi có từ hai đơn trở lên — một đơn thì không có gì để xếp. */}
          {(dong?.length ?? 0) > 1 ? (
            <View className="mt-5">
              <Nhan>Sắp xếp</Nhan>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {(Object.keys(TEN_XEP) as Xep[]).map((k) => (
                  <O key={k} nhan={TEN_XEP[k]} chon={xep === k} onPress={() => datXep(k)} />
                ))}
              </View>
            </View>
          ) : null}

          <VanNgan />

          {ds.length === 0 ? (
            <Trong loi={`Không có đơn nào khớp với "${tim.trim()}".`} />
          ) : (
            <View className="gap-4">
              {ds.map((yc) => (
                <The key={yc.ma} yc={yc} onDoi={doi} onTuChoi={tuChoi} />
              ))}
            </View>
          )}
        </View>
      ) : null}

      <View className="mt-10">
        <Nut nhan="Đăng xuất" kieu="nhe" onPress={thoat} />
      </View>

      <Modal
        visible={dangTuChoi !== null}
        transparent
        animationType="fade"
        onRequestClose={() => datDangTuChoi(null)}>
        <Pressable onPress={() => datDangTuChoi(null)} className="flex-1 bg-black/60" />
        <View
          style={{ borderColor: MAU.vien }}
          className="absolute inset-x-4 top-[22%] rounded-2xl border bg-nen-nhat p-5">
          <Text style={{ fontFamily: CHU.hoaDam, fontSize: 21 }} className="text-chu-chinh">
            Vì sao chưa nhận đơn này?
          </Text>
          <Text style={{ fontFamily: CHU.than }} className="mt-1.5 text-xs leading-5 text-chu-mo">
            Khách sẽ đọc đúng câu bạn viết. Vài chữ cũng được, nhưng đừng để trống.
          </Text>

          <TextInput
            value={lyDo}
            onChangeText={datLyDo}
            multiline
            textAlignVertical="top"
            autoFocus
            placeholder="Ví dụ: khung giờ đó mình đã kín lịch, bạn đặt lại giúp mình buổi tối nhé."
            placeholderTextColor={MAU.chuMo}
            style={{
              fontFamily: CHU.than,
              color: MAU.chuChinh,
              borderColor: MAU.vien,
              minHeight: 96,
            }}
            className="mt-4 rounded-xl border bg-nen p-3.5 text-base leading-6"
          />

          <View className="mt-5 gap-2.5">
            <Nut
              nhan="Gửi cho khách"
              tat={lyDo.trim().length < TOI_THIEU_LY_DO}
              onPress={guiTuChoi}
            />
            <Nut nhan="Thôi, để sau" kieu="nhe" onPress={() => datDangTuChoi(null)} />
          </View>
        </View>
      </Modal>
    </ManHinh>
  );
}

function The({
  yc,
  onDoi,
  onTuChoi,
}: {
  yc: YeuCau;
  onDoi: (yc: YeuCau, sang: 'da_nhan' | 'da_xong' | 'da_huy', hoi: string) => void;
  onTuChoi: (yc: YeuCau) => void;
}) {
  const tt = TEN_TRANG_THAI[yc.trang_thai];
  // Chỉ hỏi máy chủ khi thầy bấm mở. Mười đơn là mười lượt gọi cho thứ thầy có
  // thể không xem tới.
  const [moKhach, datMoKhach] = useState(false);

  return (
    <View style={{ opacity: yc.trang_thai === 'da_huy' ? 0.55 : 1 }}>
      <Khoi vang>
        <View className="mb-2 flex-row items-center justify-between">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 22 }}
            className="flex-1 pr-3 text-chu-chinh">
            {yc.ten_khach ?? 'Khách chưa đặt tên'}
          </Text>
          <Text
            style={{ fontFamily: CHU.thanDam, color: MAU_TRANG_THAI[tt.y], letterSpacing: 0.6 }}
            className="text-[11px] uppercase">
            {tt.chu}
          </Text>
        </View>

        {/* Gói lên trước và tô vàng: đó là thứ thầy cần biết ngay để xếp bao nhiêu
            thời gian cho buổi này. Đơn đặt trước khi có bảng gói thì không có dòng
            này, và đó là ý muốn — đừng bịa một gói cho đơn cũ. */}
        {yc.goi ? (
          <Text
            style={{ fontFamily: CHU.thanDam, color: MAU.vang }}
            className="mb-1 text-sm">
            {dongGoi(yc.goi, yc.gia_goi)}
          </Text>
        ) : null}

        <Text style={{ fontFamily: CHU.than }} className="mb-3 text-sm text-chu-phu">
          {yc.chu_de} · {yc.khung_gio}
          {yc.ngay_hen ? ` · hẹn ${ngayHenGon(yc.ngay_hen)}` : ''}
        </Text>

        <Nhan>Câu hỏi</Nhan>
        <ChuThan>{yc.cau_hoi}</ChuThan>

        <Pressable
          onPress={() => datMoKhach((m) => !m)}
          className="mt-4 flex-row items-center gap-1.5 self-start active:opacity-60">
          <Ionicons
            name={moKhach ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={MAU.vang}
          />
          <Text style={{ fontFamily: CHU.than }} className="text-sm text-vang">
            {moKhach ? 'Thu thông tin khách' : 'Xem thông tin khách'}
          </Text>
        </Pressable>

        {moKhach ? <ThongTinKhach maNguoiDung={yc.nguoi_dung} /> : null}

        {yc.trang_thai === 'cho_nhan' ? (
          <View className="mt-5 gap-2.5">
            <Nut nhan="Nhận đơn này" onPress={() => onDoi(yc, 'da_nhan', 'Nhận đơn này?')} />
            <Pressable
              onPress={() => onTuChoi(yc)}
              className="self-center px-4 py-2 active:opacity-60">
              <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-mo underline">
                Từ chối
              </Text>
            </Pressable>
          </View>
        ) : null}

        {yc.trang_thai === 'da_nhan' ? (
          <View className="mt-5">
            <Nut
              nhan="Đánh dấu đã xong"
              kieu="vien"
              onPress={() => onDoi(yc, 'da_xong', 'Đã tư vấn xong đơn này?')}
            />
          </View>
        ) : null}
      </Khoi>
    </View>
  );
}

/**
 * Khối thông tin khách, mở ra từ trong một đơn.
 *
 * Ảnh đại diện là KÝ HIỆU CUNG HOÀNG ĐẠO suy từ ngày sinh, không phải ảnh thật —
 * app chưa có phần cho khách tải ảnh lên. Màn Cá nhân của khách cũng dùng đúng
 * cái này, nên thầy và khách nhìn thấy một thứ giống nhau.
 */
function ThongTinKhach({ maNguoiDung }: { maNguoiDung: string }) {
  const { khach, xong } = useHoSoKhach(maNguoiDung);

  if (!xong) {
    return (
      <View className="mt-4">
        <ActivityIndicator color={MAU.vang} />
      </View>
    );
  }

  if (!khach) {
    return (
      <Text style={{ fontFamily: CHU.than }} className="mt-4 text-sm leading-6 text-chu-mo">
        Khách này chưa điền hồ sơ, hoặc đã xoá tài khoản.
      </Text>
    );
  }

  const ns = tachNgay(khach.ngay_sinh);
  const ma = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cung = ma ? timCung(ma) : null;
  const duong = duongLienHe(khach.lien_he);

  const dong: [string, string | null][] = [
    ['Ngày sinh', ngayDoc(khach.ngay_sinh)],
    ['Giờ sinh', khach.gio_sinh ? khach.gio_sinh.slice(0, 5) : null],
    ['Nơi sinh', khach.noi_sinh],
  ];

  return (
    <View style={{ borderColor: MAU.vien }} className="mt-4 rounded-xl border bg-nen p-4">
      <View className="flex-row items-center gap-3.5">
        <View
          style={{ borderColor: MAU.vangMo }}
          className="h-14 w-14 items-center justify-center rounded-full border bg-nen-nhat">
          {ma ? (
            <BieuTuongCung ma={ma} co={26} />
          ) : (
            <Ionicons name="person-outline" size={22} color={MAU.chuMo} />
          )}
        </View>
        <View className="flex-1">
          <Text style={{ fontFamily: CHU.thanDam }} className="text-base text-chu-chinh">
            {khach.ho_ten ?? 'Chưa đặt tên'}
          </Text>
          {cung ? (
            <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-sm text-chu-phu">
              {cung.ten}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-4 gap-2">
        {dong
          .filter(([, gia]) => Boolean(gia))
          .map(([nhan, gia]) => (
            <View key={nhan} className="flex-row gap-3">
              <Text
                style={{ fontFamily: CHU.than }}
                className="w-[84px] text-xs leading-5 text-chu-mo">
                {nhan}
              </Text>
              <Text style={{ fontFamily: CHU.than }} className="flex-1 text-sm text-chu-chinh">
                {gia}
              </Text>
            </View>
          ))}
      </View>

      {khach.lien_he ? (
        <Pressable
          onPress={() => (duong ? Linking.openURL(duong).catch(() => {}) : undefined)}
          disabled={!duong}
          style={{ borderColor: MAU.vang }}
          className="mt-4 flex-row items-center justify-center gap-2.5 rounded-xl border px-4 py-3 active:opacity-70">
          <Ionicons name={duong?.startsWith('tel:') ? 'call-outline' : 'open-outline'} size={16} color={MAU.vang} />
          <Text style={{ fontFamily: CHU.thanDam }} className="text-sm text-vang">
            {khach.lien_he}
          </Text>
        </Pressable>
      ) : (
        <Text style={{ fontFamily: CHU.than }} className="mt-4 text-sm leading-6 text-canh">
          Khách chưa để lại đường liên lạc. Đơn này đặt trước khi app hỏi mục đó.
        </Text>
      )}
    </View>
  );
}

/** Ô chọn cách sắp xếp. Giống hệt ô bên màn khách, cố ý để nhìn quen tay. */
function O({ nhan, chon, onPress }: { nhan: string; chon: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderColor: chon ? MAU.vang : MAU.vien,
        backgroundColor: chon ? MAU.vangRatMo : 'transparent',
      }}
      className="rounded-xl border px-4 py-2.5 active:opacity-70">
      <Text
        style={{ fontFamily: chon ? CHU.thanDam : CHU.than }}
        className={`text-sm ${chon ? 'text-vang' : 'text-chu-chinh'}`}>
        {nhan}
      </Text>
    </Pressable>
  );
}
