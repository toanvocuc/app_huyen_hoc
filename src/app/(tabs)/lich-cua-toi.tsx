/**
 * Lịch của tôi: mọi yêu cầu tư vấn đã gửi, và nó đang đi tới đâu.
 *
 * Màn này tồn tại vì một lý do thẳng thắn: nếu đặt lịch chỉ là mở Zalo rồi hết
 * thì app không giữ lại gì, và khách không có cách nào biết thầy đã nhận chưa.
 * Có chỗ theo dõi thì việc đặt lịch mới là một dịch vụ, không phải một cái nút.
 *
 * Trạng thái do phía thầy đổi, không phải app đoán. Khách chỉ tự huỷ được, và
 * chỉ khi thầy chưa nhận — luật khoá dòng dưới máy chủ chặn thêm một lớp nữa.
 */

import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Nut, Trong } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { useChuyenGia } from '@/lib/kho-noi-dung';
import {
  huyYeuCau,
  TEN_TRANG_THAI,
  useYeuCauCuaToi,
  type YeuCau,
} from '@/lib/yeu-cau';

const MAU_TRANG_THAI = {
  cho: MAU.vang,
  xong: MAU.tot,
  huy: MAU.chuMo,
} as const;

export default function LichCuaToi() {
  const { dong, loi, dangTai, lamMoi } = useYeuCauCuaToi();
  const { dong: cacThay } = useChuyenGia();

  // Đặt lịch xong là màn này hiện lên ngay. Không đọc lại mỗi lần hiện thì khách
  // thấy danh sách cũ, tưởng yêu cầu vừa gửi rơi mất.
  useFocusEffect(useCallback(() => lamMoi(), [lamMoi]));

  function hoiHuy(yc: YeuCau) {
    Alert.alert('Huỷ yêu cầu này?', 'Thầy sẽ không nhận được nữa. Bạn gửi lại lúc khác được.', [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Huỷ yêu cầu',
        style: 'destructive',
        onPress: () =>
          huyYeuCau(yc.ma)
            .then(lamMoi)
            .catch(() => Alert.alert('Chưa huỷ được', 'Kiểm tra mạng rồi thử lại giúp tôi.')),
      },
    ]);
  }

  return (
    <ManHinh tieuDe="Lịch của tôi" phu="Những buổi tư vấn bạn đã đặt.">
      {dangTai ? <DangTai /> : null}

      {loi ? (
        <View>
          <Trong loi={`Chưa tải được danh sách. ${loi}`} />
          <View className="mt-5">
            <Nut nhan="Thử lại" kieu="vien" onPress={lamMoi} />
          </View>
        </View>
      ) : null}

      {dong && dong.length === 0 ? (
        <View>
          <Trong loi="Bạn chưa đặt buổi tư vấn nào. Chọn một chuyên gia rồi gửi câu hỏi của bạn." />
          <View className="mt-5">
            <Nut nhan="Xem danh sách chuyên gia" onPress={() => router.push('/')} />
          </View>
        </View>
      ) : null}

      {dong && dong.length > 0 ? (
        <View className="gap-4">
          {dong.map((yc) => (
            <The
              key={yc.ma}
              yc={yc}
              tenThay={cacThay?.find((t) => t.ma === yc.chuyen_gia)?.ten ?? 'Chuyên gia'}
              onHuy={() => hoiHuy(yc)}
            />
          ))}
        </View>
      ) : null}
    </ManHinh>
  );
}

function The({ yc, tenThay, onHuy }: { yc: YeuCau; tenThay: string; onHuy: () => void }) {
  const tt = TEN_TRANG_THAI[yc.trang_thai];
  const mo = yc.trang_thai === 'da_huy';

  return (
    <View style={{ opacity: mo ? 0.55 : 1 }}>
      <Khoi vien={yc.trang_thai === 'cho_nhan'}>
        <View className="mb-2 flex-row items-center justify-between">
          <Text style={{ fontFamily: CHU.hoaDam, fontSize: 22 }} className="flex-1 pr-3 text-chu-chinh">
            {tenThay}
          </Text>
          <Text
            style={{ fontFamily: CHU.thanDam, color: MAU_TRANG_THAI[tt.y], letterSpacing: 0.6 }}
            className="text-[11px] uppercase">
            {tt.chu}
          </Text>
        </View>

        <Text style={{ fontFamily: CHU.than }} className="mb-3 text-sm text-chu-phu">
          {yc.chu_de} · {yc.khung_gio}
        </Text>

        <Nhan>Câu hỏi của bạn</Nhan>
        <ChuThan>{yc.cau_hoi}</ChuThan>

        {yc.trang_thai === 'cho_nhan' ? (
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
