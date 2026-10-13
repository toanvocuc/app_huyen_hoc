/**
 * Mục hỏi chuyên gia, đặt ở CUỐI màn kết quả chứ không phải nút nổi ở góc màn hình.
 * Đặt ở đây vì khách vừa đọc xong lời luận giải và đang muốn hỏi một câu cụ thể.
 *
 * Lời mời phải viết theo đúng thứ khách vừa xem, truyền vào qua `loiMoi`.
 * Dùng chung một câu cho mọi màn thì khách nhìn ra ngay là quảng cáo.
 *
 * Hiện mặt và tên người sẽ trả lời, ngay trong khối này. Trước đây chỉ có nút
 * "Nhắn cho chuyên gia" — khách không biết mình sắp nhắn cho ai, mà nhắn cho một
 * cái tên chung chung thì ai cũng ngại bấm. Bấm vào tên là mở hồ sơ đầy đủ.
 *
 * Chưa tải được hồ sơ thì vẫn hiện nút, dùng số Zalo chung. Thà nhắn cho một
 * người chưa rõ tên còn hơn mất hẳn đường liên hệ vì mạng chập chờn.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';
import { useChuyenGia } from '@/lib/kho-noi-dung';
import { moZalo } from '@/lib/nhan-zalo';
import { ghiSuKien } from '@/lib/su-kien';

type Props = {
  /** Câu mời viết riêng theo lá bài hoặc cung khách vừa xem. */
  loiMoi: string;
  /** Tên màn hình, để biết khách bấm từ đâu. */
  manHinh: string;
};

export function HoiChuyenGia({ loiMoi, manHinh }: Props) {
  const [dangGui, setDangGui] = useState(false);
  const daGhiHienThi = useRef(false);
  const { dong } = useChuyenGia();
  const thay = dong?.[0] ?? null;

  useEffect(() => {
    if (daGhiHienThi.current) return;
    daGhiHienThi.current = true;
    ghiSuKien({ loai: 'thay_muc_hoi', manHinh });
  }, [manHinh]);

  async function bam() {
    if (dangGui) return;
    setDangGui(true);
    try {
      await moZalo(thay?.zalo, manHinh);
    } finally {
      setDangGui(false);
    }
  }

  return (
    <View className="mt-8 rounded-2xl border border-vang/30 bg-nen-nhat p-5">
      <Text style={{ fontFamily: CHU.than }} className="mb-4 text-base leading-6 text-chu-chinh">
        {loiMoi}
      </Text>

      {thay ? (
        <Pressable
          onPress={() => router.push('/chuyen-gia')}
          className="mb-4 flex-row items-center gap-3 active:opacity-70">
          {thay.anh ? (
            <Image
              source={{ uri: thay.anh }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{ borderColor: MAU.vien }}
              className="h-11 w-11 items-center justify-center rounded-full border bg-nen">
              <Ionicons name="person-outline" size={20} color={MAU.chuMo} />
            </View>
          )}
          <View className="flex-1">
            <Text style={{ fontFamily: CHU.thanVua }} className="text-sm text-chu-chinh">
              {thay.ten}
            </Text>
            <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-xs text-chu-phu">
              {thay.chuyen_sau ?? 'Xem hồ sơ'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={MAU.chuMo} />
        </Pressable>
      ) : null}

      <Pressable
        onPress={bam}
        disabled={dangGui}
        className="rounded-xl bg-vang px-5 py-3 active:opacity-80">
        <Text style={{ fontFamily: CHU.thanDam }} className="text-center text-nen">
          {thay ? `Nhắn cho ${thay.ten}` : 'Nhắn cho chuyên gia'}
        </Text>
      </Pressable>
      <Text style={{ fontFamily: CHU.than }} className="mt-3 text-center text-xs text-chu-phu">
        Lời nhắn đã được chép sẵn, bạn chỉ cần dán vào Zalo
      </Text>
    </View>
  );
}
