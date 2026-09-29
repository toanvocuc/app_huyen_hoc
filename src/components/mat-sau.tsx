/**
 * Mặt sau lá bài: hoa văn la bàn vàng trên nền tím, vẽ bằng SVG.
 *
 * Dùng cho tới khi có ảnh mặt sau thật. Vẽ bằng code nên co giãn cỡ nào cũng nét,
 * và đổi màu chỉ cần sửa một chỗ.
 */

import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { MAU, TY_LE_LA_BAI } from '@/constants/giao-dien';

const VANG = MAU.vang;
const VANG_MO = 'rgba(201,162,39,0.45)';

/** Ngôi sao bốn cánh nhọn, dùng rải quanh hoa văn chính. */
function Sao({ x, y, r, mo = 1 }: { x: number; y: number; r: number; mo?: number }) {
  const eo = r * 0.22;
  return (
    <Path
      d={`M ${x} ${y - r} Q ${x + eo} ${y - eo} ${x + r} ${y} Q ${x + eo} ${y + eo} ${x} ${y + r} Q ${x - eo} ${y + eo} ${x - r} ${y} Q ${x - eo} ${y - eo} ${x} ${y - r} Z`}
      fill={VANG}
      opacity={mo}
    />
  );
}

export function MatSau({ rong = 110 }: { rong?: number }) {
  const cao = rong / TY_LE_LA_BAI;
  const W = 100;
  const H = 100 / TY_LE_LA_BAI;
  const cx = W / 2;
  const cy = H / 2;

  // La bàn: 8 tia dài xen 8 tia ngắn.
  const tia = Array.from({ length: 8 }, (_, i) => i * 45);
  const tiaNgan = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);
  const R = 26;

  return (
    <Svg width={rong} height={cao} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <SvgGradient id="nenBai" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3A2D52" />
          <Stop offset="0.5" stopColor="#2A2040" />
          <Stop offset="1" stopColor="#1B1530" />
        </SvgGradient>
      </Defs>

      <Rect x="0" y="0" width={W} height={H} rx="5" fill="url(#nenBai)" />
      <Rect x="2" y="2" width={W - 4} height={H - 4} rx="4" fill="none" stroke={VANG} strokeWidth="0.9" />
      <Rect x="4.5" y="4.5" width={W - 9} height={H - 9} rx="3" fill="none" stroke={VANG_MO} strokeWidth="0.4" />

      <G>
        <Circle cx={cx} cy={cy} r={R + 8} fill="none" stroke={VANG_MO} strokeWidth="0.4" />
        <Circle cx={cx} cy={cy} r={R - 9} fill="none" stroke={VANG_MO} strokeWidth="0.4" />

        {tia.map((g) => (
          <Path
            key={`d${g}`}
            d={`M ${cx} ${cy - R} L ${cx + 4} ${cy} L ${cx} ${cy + R} L ${cx - 4} ${cy} Z`}
            fill={VANG}
            opacity={0.92}
            transform={`rotate(${g} ${cx} ${cy})`}
          />
        ))}
        {tiaNgan.map((g) => (
          <Path
            key={`n${g}`}
            d={`M ${cx} ${cy - R * 0.55} L ${cx + 2.2} ${cy} L ${cx} ${cy + R * 0.55} L ${cx - 2.2} ${cy} Z`}
            fill={VANG}
            opacity={0.55}
            transform={`rotate(${g} ${cx} ${cy})`}
          />
        ))}

        <Circle cx={cx} cy={cy} r="4.2" fill="#1B1530" stroke={VANG} strokeWidth="0.8" />
        <Circle cx={cx} cy={cy} r="1.6" fill={VANG} />
      </G>

      <Sao x={cx} y={cy - R - 17} r={3.4} />
      <Sao x={cx} y={cy + R + 17} r={3.4} />
      <Sao x={cx - 30} y={cy - R - 6} r={2.1} mo={0.75} />
      <Sao x={cx + 30} y={cy - R - 6} r={2.1} mo={0.75} />
      <Sao x={cx - 30} y={cy + R + 6} r={2.1} mo={0.75} />
      <Sao x={cx + 30} y={cy + R + 6} r={2.1} mo={0.75} />
      <Sao x={cx - 22} y={12} r={1.5} mo={0.5} />
      <Sao x={cx + 22} y={H - 12} r={1.5} mo={0.5} />
    </Svg>
  );
}

/** Hoa văn la bàn lớn, mờ, làm nền cho màn rút bài. */
export function VanNen({ cỡ }: { cỡ: number }) {
  const c = 50;
  const tia = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <Svg width={cỡ} height={cỡ} viewBox="0 0 100 100" opacity={0.13}>
      <Circle cx={c} cy={c} r="48" fill="none" stroke={VANG} strokeWidth="0.3" />
      <Circle cx={c} cy={c} r="38" fill="none" stroke={VANG} strokeWidth="0.25" />
      <Circle cx={c} cy={c} r="26" fill="none" stroke={VANG} strokeWidth="0.3" />
      {tia.map((g) => (
        <Path
          key={g}
          d={`M ${c} ${c - 46} L ${c + 2.4} ${c} L ${c} ${c + 46} L ${c - 2.4} ${c} Z`}
          fill={VANG}
          opacity={0.5}
          transform={`rotate(${g} ${c} ${c})`}
        />
      ))}
    </Svg>
  );
}
