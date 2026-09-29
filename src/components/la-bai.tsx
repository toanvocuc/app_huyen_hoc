/**
 * Hiện một lá bài.
 *
 * Ảnh nằm trong assets/cards/ đặt tên trùng cột `ma` của bảng la_bai.
 * Chưa có ảnh thì hiện khung giữ chỗ, để dựng màn hình được ngay mà không
 * phải chờ đủ 78 file.
 */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { CHU, MAU, TY_LE_LA_BAI } from '@/constants/giao-dien';
import type { LaDaRut } from '@/lib/tarot';

const ANH: Record<string, number> = {
  // Thêm dần khi có ảnh, ví dụ:
  // 'major-00': require('@/assets/cards/major-00.jpg'),
};

export function LaBai({
  daRut,
  rong = 180,
  nhan,
  haoQuang,
}: {
  daRut: LaDaRut;
  rong?: number;
  nhan?: boolean;
  /** Quầng sáng phía sau, dùng cho lá chính của màn hình. */
  haoQuang?: boolean;
}) {
  const cao = rong / TY_LE_LA_BAI;
  const nguon = ANH[daRut.la.ma];

  return (
    <View style={{ width: rong }} className="items-center">
      {haoQuang ? (
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', MAU.vangRatMo, 'transparent']}
          locations={[0, 0.5, 1]}
          style={{
            position: 'absolute',
            width: rong * 1.5,
            height: cao * 1.12,
            top: -cao * 0.06,
            borderRadius: rong * 0.75,
          }}
        />
      ) : null}

      <View
        style={{
          width: rong,
          height: cao,
          borderColor: MAU.vangMo,
          shadowColor: '#000',
          shadowOpacity: 0.5,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        }}
        className="overflow-hidden rounded-xl border bg-nen-nhat-hon">
        {nguon ? (
          <Image
            source={nguon}
            style={{
              width: rong,
              height: cao,
              transform: [{ rotate: daRut.nguoc ? '180deg' : '0deg' }],
            }}
            contentFit="cover"
          />
        ) : (
          <GiuCho ten={daRut.la.tenVi} rong={rong} />
        )}

        {daRut.nguoc ? (
          <View className="absolute right-2 top-2 rounded-full bg-vang px-2.5 py-1">
            <Text style={{ fontFamily: CHU.thanDam }} className="text-[10px] text-nen">
              Ngược
            </Text>
          </View>
        ) : null}
      </View>

      {nhan ? (
        <Text
          style={{ fontFamily: CHU.thanDam, letterSpacing: 1.4 }}
          className="mt-2.5 text-center text-[10px] uppercase text-vang">
          {daRut.viTri}
        </Text>
      ) : null}
    </View>
  );
}

/** Khung giữ chỗ khi chưa có ảnh: viền vàng kép và tên lá. */
function GiuCho({ ten, rong }: { ten: string; rong: number }) {
  return (
    <LinearGradient colors={['#2E2542', '#1F1930']} style={{ flex: 1 }}>
      <View
        style={{ flex: 1, margin: 8, borderColor: MAU.vangMo, borderWidth: 1 }}
        className="items-center justify-center px-2">
        <View style={{ borderColor: MAU.vangMo }} className="mb-3 h-4 w-4 rotate-45 border" />
        <Text
          style={{ fontFamily: CHU.hoa, fontSize: Math.max(11, rong * 0.09) }}
          className="text-center text-chu-phu">
          {ten}
        </Text>
      </View>
    </LinearGradient>
  );
}
