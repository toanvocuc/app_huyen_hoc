/** Mặt sau lá bài và mấy hoa văn nền dùng chung cho phần Tarot. */

import { Image } from 'expo-image';
import { useEffect, useId, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { MAU, TY_LE_LA_BAI } from '@/constants/giao-dien';

/**
 * Tâm của ngôi sao giữa lá bài, đo thẳng trên file ảnh mặt sau.
 * Đổi ảnh mặt sau thì phải đo lại, không thì quầng sáng lệch khỏi ngôi sao.
 */
const TAM_SAO = { x: 0.5, y: 0.494 };

/** Ngôi sao giữa lá sáng lên rồi mờ đi, như sao thật trên trời. */
function SaoNhapNhay({ rong, cao }: { rong: number; cao: number }) {
  const ma = useId();
  const nhip = useSharedValue(0);
  // Mỗi lá lệch nhịp một chút. Để cùng nhịp thì cả nắm bài sáng tắt một lượt,
  // trông như dây đèn nháy chứ không ra sao trời.
  const tre = useRef(Math.random() * 1600).current;

  useEffect(() => {
    nhip.value = withDelay(
      tre,
      withRepeat(withTiming(1, { duration: 2300, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
  }, [nhip, tre]);

  const kieu = useAnimatedStyle(() => ({
    opacity: 0.28 + nhip.value * 0.6,
    transform: [{ scale: 0.88 + nhip.value * 0.22 }],
  }));

  // Quầng rộng hơn đĩa vàng ở giữa, để sáng lan ra cả mấy tia nắng quanh nó.
  const g = rong * 0.62;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: rong * TAM_SAO.x - g / 2,
          top: cao * TAM_SAO.y - g / 2,
          width: g,
          height: g,
        },
        kieu,
      ]}>
      <Svg width={g} height={g} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={`sao-${ma}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={MAU.vangSang} stopOpacity="0.95" />
            <Stop offset="0.18" stopColor={MAU.vangSang} stopOpacity="0.45" />
            <Stop offset="0.5" stopColor={MAU.vang} stopOpacity="0.16" />
            <Stop offset="1" stopColor={MAU.vang} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#sao-${ma})`} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Quầng vàng mờ loe ra quanh mép, cho lá bài nổi khỏi nền đen.
 *
 * Vẽ bằng SVG chứ không dùng `shadowColor`: bóng có màu chỉ chạy trên iOS và web,
 * Android đổ bóng đen theo `elevation` nên lá bài ở đó vẫn chìm nguyên.
 */
function QuangVang({ rong, cao }: { rong: number; cao: number }) {
  const ma = useId();
  const w = rong * 1.5;
  const h = cao * 1.22;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: (rong - w) / 2,
        top: (cao - h) / 2,
        width: w,
        height: h,
      }}>
      <Svg width={w} height={h} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={`quang-${ma}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={MAU.vang} stopOpacity="0.30" />
            <Stop offset="0.52" stopColor={MAU.vang} stopOpacity="0.20" />
            <Stop offset="1" stopColor={MAU.vang} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#quang-${ma})`} />
      </Svg>
    </View>
  );
}

/**
 * Mặt sau lá bài. Ảnh đã cắt sẵn về đúng tỷ lệ 0,57 của bộ Rider-Waite
 * nên xếp cạnh mặt trước không bị lệch khung.
 *
 * Ảnh mặt sau gần như đen, mà mấy màn Tarot cũng nền đen, nên để trơn thì lá bài
 * chìm hẳn vào nền. Viền vàng rõ và quầng sáng phía sau là để tách nó ra.
 */
export function MatSau({ rong = 110 }: { rong?: number }) {
  const cao = rong / TY_LE_LA_BAI;
  return (
    <View style={{ width: rong, height: cao }}>
      <QuangVang rong={rong} cao={cao} />
      <View
        style={{
          width: rong,
          height: cao,
          borderWidth: 1,
          borderColor: 'rgba(212,168,75,0.62)',
        }}
        className="overflow-hidden rounded-xl">
        <Image
          source={require('@/assets/cards/mat-sau.jpg')}
          style={{ width: rong, height: cao }}
          contentFit="cover"
        />
        <SaoNhapNhay rong={rong} cao={cao} />
      </View>
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
