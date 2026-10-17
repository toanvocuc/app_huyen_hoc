/**
 * Lịch của tôi: mọi yêu cầu tư vấn đã gửi, và nó đang đi tới đâu.
 *
 * Màn này tồn tại vì một lý do thẳng thắn: nếu đặt lịch chỉ là mở Zalo rồi hết
 * thì app không giữ lại gì, và khách không có cách nào biết thầy đã nhận chưa.
 * Có chỗ theo dõi thì việc đặt lịch mới là một dịch vụ, không phải một cái nút.
 *
 * Chia làm hai phần chứ không đổ chung một đống:
 *
 *   ĐANG CHỜ  — chờ thầy nhận, hoặc thầy đã nhận. Việc còn sống, phải thấy ngay.
 *   LỊCH SỬ   — đã xong hoặc đã huỷ. Giữ lại để tra, nhưng gấp sẵn cho gọn.
 *
 * Huỷ xong là dòng đó rời khỏi phần trên ngay. Trước đây nó nằm lại mờ mờ giữa
 * mấy việc đang chờ, nhìn rối mà cũng dễ tưởng là chưa huỷ được.
 *
 * Trạng thái do phía thầy đổi, không phải app đoán. Khách chỉ tự huỷ được, và
 * chỉ khi thầy chưa nhận — luật khoá dòng dưới máy chủ chặn thêm một lớp nữa.
 */

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { NoiLienHe } from '@/components/noi-lien-he';
import { useChuyenGia, type DongChuyenGia } from '@/lib/kho-noi-dung';
import { dongGoi } from '@/lib/goi';
import { donBoNhacHen } from '@/lib/nhac-hen';
import {
  huyYeuCau,
  ngayHenGon,
  TEN_TRANG_THAI,
  useYeuCauCuaToi,
  type YeuCau,
} from '@/lib/yeu-cau';

const MAU_TRANG_THAI = {
  cho: MAU.vang,
  xong: MAU.tot,
  huy: MAU.chuMo,
} as const;

/** Việc còn sống, chưa khép lại. */
const DANG_CHO: string[] = ['cho_nhan', 'da_nhan'];

type Xep = 'moi' | 'cu' | 'thay';

const TEN_XEP: Record<Xep, string> = {
  moi: 'Mới nhất',
  cu: 'Cũ nhất',
  thay: 'Theo tên thầy',
};

export default function LichCuaToi() {
  const { dong, loi, dangTai, lamMoi } = useYeuCauCuaToi();
  const { dong: cacThay } = useChuyenGia();
  const [xep, datXep] = useState<Xep>('moi');
  const [moLichSu, datMoLichSu] = useState(false);

  // Đặt lịch xong là màn này hiện lên ngay. Không đọc lại mỗi lần hiện thì khách
  // thấy danh sách cũ, tưởng yêu cầu vừa gửi rơi mất.
  useFocusEffect(useCallback(() => lamMoi(), [lamMoi]));

  const tenThay = useCallback(
    (ma: string) => cacThay?.find((t) => t.ma === ma)?.ten ?? 'Chuyên gia',
    [cacThay]
  );

  /**
   * Hẹn lời nhắc trước buổi tư vấn, mỗi lần danh sách đơn đổi.
   *
   * Đặt ở đây chứ không đặt lúc gửi đơn: gửi xong mới hẹn thì đơn bị huỵ, đơn
   * đổi ngày, hay khách cài lại app đều làm lịch lệch với thực tế. Đồng bộ theo
   * danh sách thật thì lần nào mở màn này cũng tự chỉnh lại cho đúng.
   */
  useEffect(() => {
    donBoNhacHen(dong, (yc) => tenThay(yc.chuyen_gia));
  }, [dong, tenThay]);

  const { dangCho, lichSu } = useMemo(() => {
    const ds = [...(dong ?? [])];
    // Xếp theo tên thầy thì dùng localeCompare tiếng Việt, không so chuỗi thô:
    // bảng mã thô cho ra Đ đứng sau Z, nên "Đức" rơi xuống tận cuối danh sách.
    ds.sort((a, b) => {
      if (xep === 'thay') {
        const c = tenThay(a.chuyen_gia).localeCompare(tenThay(b.chuyen_gia), 'vi');
        if (c !== 0) return c;
      }
      const t = a.tao_luc.localeCompare(b.tao_luc);
      return xep === 'cu' ? t : -t;
    });
    return {
      dangCho: ds.filter((y) => DANG_CHO.includes(y.trang_thai)),
      lichSu: ds.filter((y) => !DANG_CHO.includes(y.trang_thai)),
    };
  }, [dong, xep, tenThay]);

  function hoiHuy(yc: YeuCau) {
    Alert.alert(
      'Huỷ yêu cầu này?',
      'Thầy sẽ không nhận được nữa. Nó chuyển xuống mục Lịch sử, bạn vẫn xem lại được.',
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Huỷ yêu cầu',
          style: 'destructive',
          onPress: () =>
            huyYeuCau(yc.ma)
              .then(lamMoi)
              .catch(() => Alert.alert('Chưa huỷ được', 'Kiểm tra mạng rồi thử lại giúp tôi.')),
        },
      ]
    );
  }

  const coGi = (dong?.length ?? 0) > 0;

  return (
    <ManHinh
      tieuDe="Lịch của tôi"
      phu="Những buổi tư vấn bạn đã đặt."
      onLamMoi={lamMoi}
      dangLamMoi={dangTai && coGi}>
      {dangTai ? <DangTai /> : null}

      {loi ? (
        <View>
          <Trong loi={`Chưa tải được danh sách. ${loi}`} />
          <View className="mt-5">
            <Nut nhan="Thử lại" kieu="vien" onPress={lamMoi} />
          </View>
        </View>
      ) : null}

      {dong && !coGi ? (
        <View>
          <Trong loi="Bạn chưa đặt buổi tư vấn nào. Chọn một chuyên gia rồi gửi câu hỏi của bạn." />
          <View className="mt-5">
            <Nut nhan="Xem danh sách chuyên gia" onPress={() => router.push('/')} />
          </View>
        </View>
      ) : null}

      {coGi ? (
        <View>
          {/* Chỉ hiện khi có từ hai dòng trở lên — một dòng thì không có gì để xếp. */}
          {(dong?.length ?? 0) > 1 ? (
            <View className="mb-6">
              <Nhan>Sắp xếp</Nhan>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {(Object.keys(TEN_XEP) as Xep[]).map((k) => (
                  <O key={k} nhan={TEN_XEP[k]} chon={xep === k} onPress={() => datXep(k)} />
                ))}
              </View>
            </View>
          ) : null}

          {dangCho.length > 0 ? (
            <View className="gap-4">
              {dangCho.map((yc) => (
                <The
                  key={yc.ma}
                  yc={yc}
                  tenThay={tenThay(yc.chuyen_gia)}
                  thay={cacThay?.find((t) => t.ma === yc.chuyen_gia) ?? null}
                  onHuy={() => hoiHuy(yc)}
                />
              ))}
            </View>
          ) : (
            <Trong loi="Không còn yêu cầu nào đang chờ. Mọi thứ đã khép lại." />
          )}

          {lichSu.length > 0 ? (
            <View>
              <VanNgan />
              <Pressable
                onPress={() => datMoLichSu((m) => !m)}
                className="flex-row items-center justify-between py-1 active:opacity-60">
                <Text
                  style={{ fontFamily: CHU.thanDam, letterSpacing: 1.6 }}
                  className="text-[11px] uppercase text-vang">
                  Lịch sử ({lichSu.length})
                </Text>
                <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-mo">
                  {moLichSu ? 'Thu lại' : 'Xem'}
                </Text>
              </Pressable>

              {moLichSu ? (
                <View className="mt-4 gap-4">
                  {lichSu.map((yc) => (
                    <The key={yc.ma} yc={yc} tenThay={tenThay(yc.chuyen_gia)} />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </ManHinh>
  );
}

function The({
  yc,
  tenThay,
  thay,
  onHuy,
}: {
  yc: YeuCau;
  tenThay: string;
  thay?: DongChuyenGia | null;
  onHuy?: () => void;
}) {
  const tt = TEN_TRANG_THAI[yc.trang_thai];
  const ngay = new Date(yc.tao_luc);

  return (
    <View style={{ opacity: yc.trang_thai === 'da_huy' ? 0.55 : 1 }}>
      <Khoi vang>
        <View className="mb-2 flex-row items-center justify-between">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 22 }}
            className="flex-1 pr-3 text-chu-chinh">
            {tenThay}
          </Text>
          <Text
            style={{ fontFamily: CHU.thanDam, color: MAU_TRANG_THAI[tt.y], letterSpacing: 0.6 }}
            className="text-[11px] uppercase">
            {tt.chu}
          </Text>
        </View>

        {/* Ngày HỌN lên trước, to hơn, và màu vàng: đó là thứ khách cần nhìn khi mở
            màn này ra. Trước đây thế này chỉ hiện khung giờ và ngày ĐẶT đơn, nên
            khách chọn ngày hẽn xong thì không có chỗ nào xem lại mình đã chọn ngày
            nào — chính cái họ vừa chọn. Bên thầy thì vẫn thấy bình thường. */}
        {yc.ngay_hen ? (
          <Text
            style={{ fontFamily: CHU.thanDam, color: MAU.vang }}
            className="mb-1 text-sm">
            Hẽn ngày {ngayHenGon(yc.ngay_hen)} · {yc.khung_gio}
          </Text>
        ) : null}

        <Text style={{ fontFamily: CHU.than }} className="mb-3 text-sm text-chu-phu">
          {dongGoi(yc.goi, yc.gia_goi) ?? yc.chu_de}
          {yc.ngay_hen ? '' : ` · ${yc.khung_gio}`} · đặt ngày {ngay.getDate()}/
          {ngay.getMonth() + 1}
        </Text>

        <Nhan>Câu hỏi của bạn</Nhan>
        <ChuThan>{yc.cau_hoi}</ChuThan>

        {/* Lý do thầy từ chối, bày ngay trong đơn.

            Trước đây câu này chỉ đi theo một dòng thông báo — mà thông báo thì
            khách xoá được, và họ xoá thật. Xoá xong thì đơn chỉ còn chữ "Đã huỵ"
            trơ trọi, trong khi lý do vẫn nằm nguyên trong đơn dưới máy chủ. Bắt
            thầy viết tay một câu rồi để câu đó bay mất là bỏ công vô ích. */}
        {yc.trang_thai === 'da_huy' && yc.ly_do ? (
          <View className="mt-4">
            <Nhan>Thầy nhắn lại</Nhan>
            <ChuThan>{yc.ly_do}</ChuThan>
          </View>
        ) : null}

        {/* Nơi liên hệ của thầy, bày ngay trong đơn. Khách vừa đặt xong là có
            sẵn đường nhắn, không phải quay ra tìm lại hồ sơ thầy. */}
        {thay ? (
          <View className="mt-5">
            <Nhan>Nhắn cho {tenThay}</Nhan>
            <View className="mt-2">
              <NoiLienHe thay={thay} gon />
            </View>
          </View>
        ) : null}

        {onHuy && yc.trang_thai === 'cho_nhan' ? (
          <Pressable onPress={onHuy} className="mt-4 self-start active:opacity-60">
            <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-mo underline">
              Huỷ yêu cầu
            </Text>
          </Pressable>
        ) : null}
      </Khoi>
    </View>
  );
}

/** Ô chọn cách sắp xếp. Giống hệt ô trong màn đặt lịch, cố ý để nhìn quen tay. */
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
