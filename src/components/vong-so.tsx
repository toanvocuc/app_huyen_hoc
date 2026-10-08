/** Con số chủ đạo đặt giữa vòng hào quang có tia, vẽ bằng SVG. */

import { Text, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { CHU, MAU } from '@/constants/giao-dien';

export function VongSo({ so, co = 190 }: { so: number | null; co?: number }) {
  const c = 50;
  const tiaDai = Array.from({ length: 12 }, (_, i) => i * 30);
  const tiaNgan = Array.from({ length: 12 }, (_, i) => i * 30 + 15);

  return (
    <View style={{ width: co, height: co }} className="items-center justify-center">
      <Svg width={co} height={co} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="loi" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={MAU.vang} stopOpacity="0.22" />
            <Stop offset="0.65" stopColor={MAU.vang} stopOpacity="0.05" />
            <Stop offset="1" stopColor={MAU.vang} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Circle cx={c} cy={c} r="48" fill="url(#loi)" />

        {tiaDai.map((g) => (
          <Path
            key={`d${g}`}
            d={`M ${c} 4 L ${c + 1.5} 15 L ${c} 18 L ${c - 1.5} 15 Z`}
            fill={MAU.vang}
            opacity={0.85}
            transform={`rotate(${g} ${c} ${c})`}
          />
        ))}
        {tiaNgan.map((g) => (
          <Path
            key={`n${g}`}
            d={`M ${c} 8 L ${c + 0.9} 14 L ${c} 16 L ${c - 0.9} 14 Z`}
            fill={MAU.vang}
            opacity={0.45}
            transform={`rotate(${g} ${c} ${c})`}
          />
        ))}

        <Circle cx={c} cy={c} r="31" fill="none" stroke={MAU.vang} strokeWidth="1.1" />
        <Circle cx={c} cy={c} r="27" fill="none" stroke={MAU.vang} strokeWidth="0.4" opacity={0.5} />
      </Svg>

      {/*
        Dùng phông thân, không dùng phông có chân: Cormorant viết chữ số kiểu cổ
        nên số 4 nằm thấp còn số 6 nằm cao, đặt giữa vòng tròn là thấy lệch tâm
        theo từng số. Xem thêm ghi chú ở o-vuong-sinh.tsx.
      */}
      <Text
        style={{ fontFamily: CHU.thanDam, fontSize: co * 0.34, lineHeight: co * 0.4, color: MAU.vang }}>
        {so ?? '—'}
      </Text>
    </View>
  );
}
