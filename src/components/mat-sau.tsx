/** Mặt sau lá bài và mấy hoa văn nền dùng chung cho phần Tarot. */

import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { MAU, TY_LE_LA_BAI } from '@/constants/giao-dien';

/**
 * Mặt sau lá bài. Ảnh đã cắt sẵn về đúng tỷ lệ 0,57 của bộ Rider-Waite
 * nên xếp cạnh mặt trước không bị lệch khung.
 */
export function MatSau({ rong = 110 }: { rong?: number }) {
  const cao = rong / TY_LE_LA_BAI;
  return (
    <View
      style={{
        width: rong,
        height: cao,
        borderColor: MAU.vangMo,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 6,
      }}
      className="overflow-hidden rounded-xl border">
      <Image
        source={require('@/assets/cards/mat-sau.jpg')}
        style={{ width: rong, height: cao }}
        contentFit="cover"
      />
    </View>
  );
}

/** Hoa văn la bàn lớn, mờ, dùng khi cần một vòng tròn trang trí vẽ bằng nét. */
export function VanNen({ cỡ }: { cỡ: number }) {
  const c = 50;
  const tia = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <Svg width={cỡ} height={cỡ} viewBox="0 0 100 100" opacity={0.13}>
      <Circle cx={c} cy={c} r="48" fill="none" stroke={MAU.vang} strokeWidth="0.3" />
      <Circle cx={c} cy={c} r="38" fill="none" stroke={MAU.vang} strokeWidth="0.25" />
      <Circle cx={c} cy={c} r="26" fill="none" stroke={MAU.vang} strokeWidth="0.3" />
      {tia.map((g) => (
        <Path
          key={g}
          d={`M ${c} ${c - 46} L ${c + 2.4} ${c} L ${c} ${c + 46} L ${c - 2.4} ${c} Z`}
          fill={MAU.vang}
          opacity={0.5}
          transform={`rotate(${g} ${c} ${c})`}
        />
      ))}
    </Svg>
  );
}
