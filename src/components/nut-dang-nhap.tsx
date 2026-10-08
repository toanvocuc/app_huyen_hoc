/**
 * Nút đăng nhập của Google và Apple.
 *
 * Không dùng nút vàng chung của app: hai hãng này có quy định riêng về hình nút
 * của họ. Apple bắt nút "Sign in with Apple" chỉ được đen, trắng, hoặc trắng
 * viền đen, kèm đúng biểu tượng quả táo. Tô vàng theo màu app là vi phạm và bị
 * trả hồ sơ.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ChumSaoToa, SAO_TREN_NEN_SANG } from '@/components/hieu-ung-sao';
import { CHU, MAU } from '@/constants/giao-dien';

export function NutDangNhap({
  hang,
  nhan,
  onPress,
  dangChay,
  tat,
}: {
  hang: 'apple' | 'google';
  nhan: string;
  onPress: () => void;
  dangChay?: boolean;
  tat?: boolean;
}) {
  const apple = hang === 'apple';
  const lucBam = useRef(0);
  const [lanBam, setLanBam] = useState(0);

  // Chặn cú bấm thứ hai như nút chung, vì mở trình duyệt đăng nhập hai lần là
  // khách thấy hai hộp thoại chồng nhau.
  const bam = () => {
    const gio = Date.now();
    if (gio - lucBam.current < 800) return;
    lucBam.current = gio;
    setLanBam((n) => n + 1);
    onPress();
  };

  const nenNut = apple ? '#FFFFFF' : MAU.nenNhat;
  const mauChu = apple ? '#000000' : MAU.chuChinh;

  return (
    <Pressable
      onPress={bam}
      disabled={tat || dangChay}
      style={{
        backgroundColor: nenNut,
        borderColor: apple ? '#FFFFFF' : MAU.vien,
        opacity: tat ? 0.4 : 1,
      }}
      className="min-h-[54px] flex-row items-center justify-center gap-2.5 rounded-[14px] border active:opacity-80">
      {dangChay ? (
        <ActivityIndicator color={mauChu} />
      ) : (
        <>
          <Ionicons name={apple ? 'logo-apple' : 'logo-google'} size={20} color={mauChu} />
          <Text style={{ fontFamily: CHU.thanDam, color: mauChu }} className="text-base">
            {nhan}
          </Text>
        </>
      )}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        <ChumSaoToa lan={lanBam} mau={apple ? SAO_TREN_NEN_SANG : undefined} />
      </View>
    </Pressable>
  );
}
