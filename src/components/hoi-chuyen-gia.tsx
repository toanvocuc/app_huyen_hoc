/**
 * Mục hỏi chuyên gia, đặt ở CUỐI màn kết quả chứ không phải nút nổi ở góc màn hình.
 * Đặt ở đây vì khách vừa đọc xong lời luận giải và đang muốn hỏi một câu cụ thể.
 *
 * Lời mời phải viết theo đúng thứ khách vừa xem, truyền vào qua `loiMoi`.
 * Dùng chung một câu cho mọi màn thì khách nhìn ra ngay là quảng cáo.
 *
 * Về đo đếm: khách bấm sang Zalo rồi thì app không theo dõi được nữa. Nên mỗi lần bấm
 * sinh một mã ngắn, chép sẵn vào lời nhắn. Người trực Zalo ghi mã đó lại là khớp được
 * hai đầu. Bỏ mã đi thì con số báo lên chỉ là số lượt bấm, không phải số khách thật.
 */

import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import { ghiSuKien, sinhMaTheoDoi } from '@/lib/su-kien';

// TODO: thay bằng số Zalo của công ty. Không dùng số riêng của từng thầy —
// tới Phase 3 mở sàn thì không đi đòi lại số cá nhân đã nằm trong máy khách được.
const ZALO_CONG_TY = process.env.EXPO_PUBLIC_ZALO_CONG_TY ?? '';

type Props = {
  /** Câu mời viết riêng theo lá bài hoặc cung khách vừa xem. */
  loiMoi: string;
  /** Tên màn hình, để biết khách bấm từ đâu. */
  manHinh: string;
};

export function HoiChuyenGia({ loiMoi, manHinh }: Props) {
  const [dangGui, setDangGui] = useState(false);
  const daGhiHienThi = useRef(false);

  useEffect(() => {
    if (daGhiHienThi.current) return;
    daGhiHienThi.current = true;
    ghiSuKien({ loai: 'thay_muc_hoi', manHinh });
  }, [manHinh]);

  async function bam() {
    if (dangGui) return;
    setDangGui(true);
    try {
      const ma = sinhMaTheoDoi();
      await ghiSuKien({ loai: 'bam_zalo', manHinh, maTheoDoi: ma });
      await Clipboard.setStringAsync(`Mình đến từ app, mã ${ma}`);

      if (!ZALO_CONG_TY) {
        Alert.alert('Chưa đặt số Zalo', 'Điền EXPO_PUBLIC_ZALO_CONG_TY vào file .env.');
        return;
      }
      const duocKhong = await Linking.canOpenURL(`https://zalo.me/${ZALO_CONG_TY}`);
      if (!duocKhong) {
        Alert.alert('Không mở được Zalo', 'Máy chưa cài Zalo hoặc bị chặn.');
        return;
      }
      await Linking.openURL(`https://zalo.me/${ZALO_CONG_TY}`);
    } finally {
      setDangGui(false);
    }
  }

  return (
    <View className="mt-8 rounded-2xl border border-vang/30 bg-nen-nhat p-5">
      <Text className="mb-3 text-base leading-6 text-chu-chinh">{loiMoi}</Text>
      <Pressable
        onPress={bam}
        disabled={dangGui}
        className="rounded-xl bg-vang px-5 py-3 active:opacity-80">
        <Text className="text-center font-semibold text-nen">Nhắn cho chuyên gia</Text>
      </Pressable>
      <Text className="mt-3 text-center text-xs text-chu-phu">
        Lời nhắn đã được chép sẵn, bạn chỉ cần dán vào Zalo
      </Text>
    </View>
  );
}
