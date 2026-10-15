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
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { supabase } from '@/lib/supabase';
import { useLaThay } from '@/lib/thay';
import { daCoQuyen, dangKyMaDay, xinQuyen } from '@/lib/thong-bao';
import { TEN_TRANG_THAI, thayDoiTrangThai, useDonChoThay, type YeuCau } from '@/lib/yeu-cau';

const MAU_TRANG_THAI = { cho: MAU.vang, xong: MAU.tot, huy: MAU.chuMo } as const;

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
  const [dangXin, datDangXin] = useState(false);
  const [xep, datXep] = useState<Xep>('moi');
  const [tim, datTim] = useState('');

  useFocusEffect(
    useCallback(() => {
      daCoQuyen()
        .then(datCoQuyen)
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
      if (duoc) await dangKyMaDay();
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

  function thoat() {
    Alert.alert('Đăng xuất?', 'Bạn sẽ không nhận được thông báo đơn mới nữa.', [
      { text: 'Ở lại', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () =>
          supabase.auth
            .signOut()
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
    <ManHinh tieuDe="Đơn của bạn" phu={`Đang làm việc với tư cách ${thay.ten}`}>
      {coQuyen === false ? (
        <View className="mb-6">
          <Khoi vien>
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
            placeholder="Tìm theo tên khách, ngày, hoặc chủ đề"
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
                <The key={yc.ma} yc={yc} onDoi={doi} />
              ))}
            </View>
          )}
        </View>
      ) : null}

      <View className="mt-10">
        <Nut nhan="Đăng xuất" kieu="nhe" onPress={thoat} />
      </View>
    </ManHinh>
  );
}

function The({
  yc,
  onDoi,
}: {
  yc: YeuCau;
  onDoi: (yc: YeuCau, sang: 'da_nhan' | 'da_xong' | 'da_huy', hoi: string) => void;
}) {
  const tt = TEN_TRANG_THAI[yc.trang_thai];

  return (
    <View style={{ opacity: yc.trang_thai === 'da_huy' ? 0.55 : 1 }}>
      <Khoi vien={yc.trang_thai === 'cho_nhan'}>
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

        <Text style={{ fontFamily: CHU.than }} className="mb-3 text-sm text-chu-phu">
          {yc.chu_de} · {yc.khung_gio} · ngày {ngayGon(yc.tao_luc)}
        </Text>

        <Nhan>Câu hỏi</Nhan>
        <ChuThan>{yc.cau_hoi}</ChuThan>

        {yc.trang_thai === 'cho_nhan' ? (
          <View className="mt-5 gap-2.5">
            <Nut nhan="Nhận đơn này" onPress={() => onDoi(yc, 'da_nhan', 'Nhận đơn này?')} />
            <Pressable
              onPress={() => onDoi(yc, 'da_huy', 'Từ chối đơn này?')}
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
