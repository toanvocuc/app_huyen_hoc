/**
 * Hiện một lá bài.
 *
 * Ảnh nằm trong assets/cards/ đặt tên trùng cột `ma` của bảng la_bai.
 * Đủ 78 lá. Khung giữ chỗ chỉ còn dùng khi thiếu file.
 */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { CHU, MAU, TY_LE_LA_BAI } from '@/constants/giao-dien';
import type { LaDaRut } from '@/lib/tarot';

const ANH: Record<string, number> = {
  'major-00': require('@/assets/cards/major-00.jpg'),
  'major-01': require('@/assets/cards/major-01.jpg'),
  'major-02': require('@/assets/cards/major-02.jpg'),
  'major-03': require('@/assets/cards/major-03.jpg'),
  'major-04': require('@/assets/cards/major-04.jpg'),
  'major-05': require('@/assets/cards/major-05.jpg'),
  'major-06': require('@/assets/cards/major-06.jpg'),
  'major-07': require('@/assets/cards/major-07.jpg'),
  'major-08': require('@/assets/cards/major-08.jpg'),
  'major-09': require('@/assets/cards/major-09.jpg'),
  'major-10': require('@/assets/cards/major-10.jpg'),
  'major-11': require('@/assets/cards/major-11.jpg'),
  'major-12': require('@/assets/cards/major-12.jpg'),
  'major-13': require('@/assets/cards/major-13.jpg'),
  'major-14': require('@/assets/cards/major-14.jpg'),
  'major-15': require('@/assets/cards/major-15.jpg'),
  'major-16': require('@/assets/cards/major-16.jpg'),
  'major-17': require('@/assets/cards/major-17.jpg'),
  'major-18': require('@/assets/cards/major-18.jpg'),
  'major-19': require('@/assets/cards/major-19.jpg'),
  'major-20': require('@/assets/cards/major-20.jpg'),
  'major-21': require('@/assets/cards/major-21.jpg'),
  'cups-01': require('@/assets/cards/cups-01.jpg'),
  'cups-02': require('@/assets/cards/cups-02.jpg'),
  'cups-03': require('@/assets/cards/cups-03.jpg'),
  'cups-04': require('@/assets/cards/cups-04.jpg'),
  'cups-05': require('@/assets/cards/cups-05.jpg'),
  'cups-06': require('@/assets/cards/cups-06.jpg'),
  'cups-07': require('@/assets/cards/cups-07.jpg'),
  'cups-08': require('@/assets/cards/cups-08.jpg'),
  'cups-09': require('@/assets/cards/cups-09.jpg'),
  'cups-10': require('@/assets/cards/cups-10.jpg'),
  'cups-11': require('@/assets/cards/cups-11.jpg'),
  'cups-12': require('@/assets/cards/cups-12.jpg'),
  'cups-13': require('@/assets/cards/cups-13.jpg'),
  'cups-14': require('@/assets/cards/cups-14.jpg'),
  'wands-01': require('@/assets/cards/wands-01.jpg'),
  'wands-02': require('@/assets/cards/wands-02.jpg'),
  'wands-03': require('@/assets/cards/wands-03.jpg'),
  'wands-04': require('@/assets/cards/wands-04.jpg'),
  'wands-05': require('@/assets/cards/wands-05.jpg'),
  'wands-06': require('@/assets/cards/wands-06.jpg'),
  'wands-07': require('@/assets/cards/wands-07.jpg'),
  'wands-08': require('@/assets/cards/wands-08.jpg'),
  'wands-09': require('@/assets/cards/wands-09.jpg'),
  'wands-10': require('@/assets/cards/wands-10.jpg'),
  'wands-11': require('@/assets/cards/wands-11.jpg'),
  'wands-12': require('@/assets/cards/wands-12.jpg'),
  'wands-13': require('@/assets/cards/wands-13.jpg'),
  'wands-14': require('@/assets/cards/wands-14.jpg'),
  'swords-01': require('@/assets/cards/swords-01.jpg'),
  'swords-02': require('@/assets/cards/swords-02.jpg'),
  'swords-03': require('@/assets/cards/swords-03.jpg'),
  'swords-04': require('@/assets/cards/swords-04.jpg'),
  'swords-05': require('@/assets/cards/swords-05.jpg'),
  'swords-06': require('@/assets/cards/swords-06.jpg'),
  'swords-07': require('@/assets/cards/swords-07.jpg'),
  'swords-08': require('@/assets/cards/swords-08.jpg'),
  'swords-09': require('@/assets/cards/swords-09.jpg'),
  'swords-10': require('@/assets/cards/swords-10.jpg'),
  'swords-11': require('@/assets/cards/swords-11.jpg'),
  'swords-12': require('@/assets/cards/swords-12.jpg'),
  'swords-13': require('@/assets/cards/swords-13.jpg'),
  'swords-14': require('@/assets/cards/swords-14.jpg'),
  'pents-01': require('@/assets/cards/pents-01.jpg'),
  'pents-02': require('@/assets/cards/pents-02.jpg'),
  'pents-03': require('@/assets/cards/pents-03.jpg'),
  'pents-04': require('@/assets/cards/pents-04.jpg'),
  'pents-05': require('@/assets/cards/pents-05.jpg'),
  'pents-06': require('@/assets/cards/pents-06.jpg'),
  'pents-07': require('@/assets/cards/pents-07.jpg'),
  'pents-08': require('@/assets/cards/pents-08.jpg'),
  'pents-09': require('@/assets/cards/pents-09.jpg'),
  'pents-10': require('@/assets/cards/pents-10.jpg'),
  'pents-11': require('@/assets/cards/pents-11.jpg'),
  'pents-12': require('@/assets/cards/pents-12.jpg'),
  'pents-13': require('@/assets/cards/pents-13.jpg'),
  'pents-14': require('@/assets/cards/pents-14.jpg'),
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
          <GiuCho ten={daRut.la.tenEn} rong={rong} />
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
