/**
 * Màn đặt lịch tư vấn.
 *
 * Đây là phần ruột của app sau khi đổi trục. Trước đây bấm vào thầy là mở thẳng
 * Zalo — làm vậy thì app không có việc gì của riêng mình, chỉ là lối tắt sang
 * ứng dụng khác, và Apple có điều 4.2 dành riêng cho loại đó.
 *
 * Thứ tự ở đây có chủ ý: GHI XUỐNG MÁY CHỦ TRƯỚC, mở Zalo sau. Hỏng bước Zalo
 * thì yêu cầu vẫn nằm đó, thầy vẫn thấy, khách vẫn theo dõi được trong mục Lịch
 * của tôi. Làm ngược lại là khách nhắn xong mà app không có dấu vết gì.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ChuThan, Khoi, ManHinh, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { useChuyenGia } from '@/lib/kho-noi-dung';
import { moZalo } from '@/lib/nhan-zalo';
import { guiYeuCau, KHUNG_GIO, tachChuDe } from '@/lib/yeu-cau';

/** Dài tối thiểu cho câu hỏi. Ngắn hơn thì thầy không có gì để bắt đầu. */
const TOI_THIEU = 15;

export default function DatLich() {
  const { thay: maThay } = useLocalSearchParams<{ thay: string }>();
  const { dong } = useChuyenGia();
  const thay = useMemo(() => dong?.find((t) => t.ma === maThay) ?? null, [dong, maThay]);

  const chuDe = tachChuDe(thay?.chuyen_sau);
  const [chonChuDe, datChonChuDe] = useState<string | null>(null);
  const [chonGio, datChonGio] = useState<string | null>(null);
  const [cauHoi, datCauHoi] = useState('');
  const [dangGui, datDangGui] = useState(false);
  const [loi, datLoi] = useState<string | null>(null);

  // Thầy chỉ khai một mảng thì không có gì để chọn, tự lấy luôn.
  const chuDeThat = chonChuDe ?? (chuDe.length === 1 ? chuDe[0] : null);
  const duDieuKien = Boolean(chuDeThat && chonGio && cauHoi.trim().length >= TOI_THIEU);

  async function gui() {
    if (!thay || !chuDeThat || !chonGio) return;
    datLoi(null);
    datDangGui(true);
    try {
      await guiYeuCau({
        chuyenGia: thay.ma,
        chuDe: chuDeThat,
        khungGio: chonGio,
        cauHoi,
      });
      // Sang thẳng mục Lịch của tôi để khách thấy ngay yêu cầu vừa gửi, rồi mới
      // mở Zalo. Thấy nó nằm trong app trước thì mới tin là đã gửi thật.
      router.replace('/lich-cua-toi');
      await moZalo(thay.zalo, 'dat-lich');
    } catch (e) {
      datLoi(e instanceof Error ? e.message : 'Chưa gửi được, thử lại giúp tôi.');
      datDangGui(false);
    }
  }

  if (!thay) {
    return (
      <ManHinh quayLai tieuDe="Đặt lịch">
        <Trong loi="Không tìm thấy chuyên gia này. Quay lại danh sách rồi chọn lại giúp tôi." />
      </ManHinh>
    );
  }

  return (
    <ManHinh quayLai tieuDe="Đặt lịch tư vấn" phu={`Với ${thay.ten}`}>
      {chuDe.length > 1 ? (
        <View className="mb-7">
          <Nhan>Bạn muốn hỏi về</Nhan>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {chuDe.map((c) => (
              <O key={c} nhan={c} chon={chuDeThat === c} onPress={() => datChonChuDe(c)} />
            ))}
          </View>
        </View>
      ) : null}

      <View className="mb-7">
        <Nhan>Bạn rảnh khi nào</Nhan>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {KHUNG_GIO.map((g) => (
            <O key={g} nhan={g} chon={chonGio === g} onPress={() => datChonGio(g)} />
          ))}
        </View>
      </View>

      <View className="mb-7">
        <Nhan>Câu hỏi của bạn</Nhan>
        <Text style={{ fontFamily: CHU.than }} className="mb-2 mt-1 text-xs leading-5 text-chu-mo">
          Viết càng rõ hoàn cảnh thì thầy càng trả lời được sát. Chỉ mình thầy đọc được.
        </Text>
        <TextInput
          value={cauHoi}
          onChangeText={datCauHoi}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          placeholder="Ví dụ: em đang phân vân giữa hai lời mời làm việc…"
          placeholderTextColor={MAU.chuMo}
          style={{
            fontFamily: CHU.than,
            color: MAU.chuChinh,
            borderColor: MAU.vien,
            minHeight: 120,
          }}
          className="rounded-2xl border bg-nen-nhat p-4 text-base leading-6"
        />
      </View>

      <Khoi>
        <Nhan>Sau khi gửi</Nhan>
        <ChuThan>
          Yêu cầu nằm trong mục Lịch của tôi, bạn theo dõi được thầy đã nhận chưa. Omora mở
          Zalo để bạn nói chuyện trực tiếp với thầy. Tiền trả thẳng cho thầy, Omora không
          thu hộ.
        </ChuThan>
      </Khoi>

      {loi ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-5 text-sm leading-5 text-canh">
          {loi}
        </Text>
      ) : null}

      <VanNgan />

      <Nut nhan="Gửi yêu cầu" tat={!duDieuKien} dangChay={dangGui} onPress={gui} />
      {!duDieuKien && cauHoi.trim().length > 0 && cauHoi.trim().length < TOI_THIEU ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-3 text-center text-xs text-chu-mo">
          Viết thêm vài chữ nữa giúp tôi.
        </Text>
      ) : null}
    </ManHinh>
  );
}

/** Một ô chọn. Dùng chung cho chủ đề và khung giờ nên không đặt tên theo việc nào cả. */
function O({ nhan, chon, onPress }: { nhan: string; chon: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      // Nền và viền đặt bằng style chứ không bằng lớp Tailwind: bộ màu trong
      // tailwind.config.js không khai vangRatMo, mà lớp không có thật thì
      // NativeWind bỏ qua im lặng — ô được chọn trông y hệt ô chưa chọn.
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
