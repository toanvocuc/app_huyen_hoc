/** Ký hiệu 12 cung hoàng đạo, vẽ bằng nét SVG cho nhẹ và co giãn được. */

import Svg, { Circle, Path } from 'react-native-svg';

import { MAU } from '@/constants/giao-dien';
import type { MaCung } from '@/lib/zodiac';

// Nét vẽ trong khung 24x24, gốc toạ độ góc trên bên trái.
const NET: Record<MaCung, string> = {
  aries: 'M5 17c0-6 1-10 4-10s3 3 3 5m0 0c0-2 0-5 3-5s4 4 4 10',
  taurus: 'M6 4c1.6 2.2 3.6 3.4 6 3.4S16.4 6.2 18 4M12 9a5.5 5.5 0 100 11 5.5 5.5 0 000-11z',
  gemini: 'M6 4.5c4 1.6 8 1.6 12 0M6 19.5c4-1.6 8-1.6 12 0M9 5v14M15 5v14',
  cancer: 'M4 9c3-3.5 8-4 11-1.5M20 15c-3 3.5-8 4-11 1.5M7.5 7.5a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM16.5 11.3a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2z',
  leo: 'M9.5 18c-2.6 0-4.5-1.7-4.5-4s1.6-3.6 3.4-3.6c1.5 0 2.6 1 2.6 2.4M11 12.8c0-3.4-.6-5.2-.6-6.6C10.4 4.8 11.4 4 12.8 4c1.5 0 2.5 1 2.5 2.6 0 2-1.3 3.4-1.3 5.4 0 2.4 1.4 3.6 3 3.6',
  virgo: 'M4 8c0-1.6.9-2.4 2-2.4S8 6.4 8 8v8M8 8c0-1.6.9-2.4 2-2.4S12 6.4 12 8v8M12 8c0-1.6.9-2.4 2-2.4s2 .8 2 2.4c0 4-.4 7 1.5 9.2M14 14c3 0 5 2 5 4.6',
  libra: 'M4 19h16M4 14.5h5.5a4.6 4.6 0 119 0H20',
  scorpio: 'M4 8c0-1.6.9-2.4 2-2.4S8 6.4 8 8v8M8 8c0-1.6.9-2.4 2-2.4S12 6.4 12 8v8M12 8c0-1.6.9-2.4 2-2.4s2 .8 2 2.4v8.5l3.2 2.5M19.2 19v-3.2M19.2 19H16',
  sagittarius: 'M5 19L19 5M12 5h7v7M8.5 12.5l3 3',
  capricorn: 'M4 7c0-1.4.8-2.2 1.9-2.2S8 5.6 8 7v9M8 7c0-1.4.8-2.2 1.9-2.2S12 5.6 12 7v6.5c0 2 1.2 3.2 2.8 3.2 1.7 0 2.9-1.3 2.9-3.1 0-1.7-1.2-3-2.8-3-2.6 0-3.6 2.4-3.6 4.9',
  aquarius: 'M3 9.5l3-2.6 3 2.6 3-2.6 3 2.6 3-2.6M3 15.5l3-2.6 3 2.6 3-2.6 3 2.6 3-2.6',
  pisces: 'M7 4.5c-2.6 3-2.6 12 0 15M17 4.5c2.6 3 2.6 12 0 15M4 12h16',
};

export function BieuTuongCung({
  ma,
  co = 26,
  mau = MAU.vang,
}: {
  ma: MaCung;
  co?: number;
  mau?: string;
}) {
  return (
    <Svg width={co} height={co} viewBox="0 0 24 24">
      <Path
        d={NET[ma]}
        stroke={mau}
        strokeWidth={1.35}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {ma === 'taurus' ? <Circle cx="0" cy="0" r="0" fill="none" /> : null}
    </Svg>
  );
}
