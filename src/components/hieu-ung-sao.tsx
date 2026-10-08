/** Chùm sao nhỏ toả ra rồi tắt, dùng cho hiệu ứng bấm nút. */

import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

/** Ngôi sao bốn cánh, cùng hình với mấy tia lấp lánh ở nút quay lại. */
export const DUONG_SAO =
  'M50 0C52.4 35.2 64.8 47.6 100 50C64.8 52.4 52.4 64.8 50 100C47.6 64.8 35.2 52.4 0 50C35.2 47.6 47.6 35.2 50 0Z';

const SO_SAO = 9;
const THOI_GIAN = 430;

/**
 * Toả rộng ngang hơn dọc, nhưng vẫn cho bay hẳn ra ngoài nút.
 *
 * Bản đầu bó chùm sao nằm gọn trong nút vì sợ Android cắt mất phần con nằm
 * ngoài cha. Dựng ra mới thấy hỏng hẳn: sao vàng trên nền nút cũng vàng thì
 * gần như không nhìn thấy gì, coi như không có hiệu ứng.
 *
 * Thực ra cái bọc ngoài là View trơn, không nền không bo góc, nên không cắt
 * con. Chỗ cắt là LinearGradient có bo góc, và chùm sao đã để ngoài nó rồi.
 */
const XA_NGANG = 92;
const XA_DOC = 52;

/**
 * Trắng ngả vàng, đọc được trên cả hai nền.
 *
 * Nút chính nền vàng đặc, mấy nút kia nền xanh đêm. Màu vàng sáng chìm hẳn vào
 * nút chính, còn màu này nổi trên vàng mà vẫn ra dáng ngôi sao trên nền tối.
 */
const MAU_SAO = '#FFF7E3';

/** Sao bắn trên nền sáng, ví dụ nút Apple nền trắng. */
export const SAO_TREN_NEN_SANG = '#C79A2E';

function MotSao({ i, mau }: { i: number; mau: string }) {
  const t = useSharedValue(0);

  // Tính một lần cho mỗi ngôi sao. Để trong thân hàm thì mỗi lần vẽ lại là góc
  // đổi, sao đang bay sẽ giật sang hướng khác.
  const { goc, nganh, doc, co, tre } = useMemo(() => {
    const g = (i / SO_SAO) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
    const manh = 0.55 + Math.random() * 0.65;
    return {
      goc: g,
      nganh: XA_NGANG * manh,
      doc: XA_DOC * manh,
      co: 7 + Math.random() * 6,
      tre: Math.random() * 70,
    };
  }, [i]);

  useEffect(() => {
    t.value = withDelay(tre, withTiming(1, { duration: THOI_GIAN, easing: Easing.out(Easing.quad) }));
  }, [t, tre]);

  const kieu = useAnimatedStyle(() => {
    // Sáng lên rất nhanh ở một phần tư đầu rồi tắt dần, cho ra cảm giác bắn ra.
    const mo = t.value < 0.25 ? t.value / 0.25 : 1 - (t.value - 0.25) / 0.75;
    return {
      opacity: mo,
      transform: [
        { translateX: Math.cos(goc) * nganh * t.value },
        { translateY: Math.sin(goc) * doc * t.value },
        { scale: 0.35 + t.value * 0.75 },
        { rotate: `${t.value * 110}deg` },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: '50%', top: '50%', marginLeft: -co / 2, marginTop: -co / 2, width: co, height: co },
        kieu,
      ]}>
      <Svg width={co} height={co} viewBox="0 0 100 100">
        <Path d={DUONG_SAO} fill={mau} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Mỗi lần `lan` tăng là bắn một chùm mới.
 *
 * Dùng `lan` trong key để React dựng lại từng ngôi sao, nhờ vậy bấm liên tiếp
 * thì chùm sau chạy lại từ đầu chứ không nối tiếp chùm trước.
 */
export function ChumSaoToa({ lan, mau = MAU_SAO }: { lan: number; mau?: string }) {
  const dungNhay = useReducedMotion();
  if (dungNhay || lan === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: SO_SAO }, (_, i) => (
        <MotSao key={`${lan}-${i}`} i={i} mau={mau} />
      ))}
    </View>
  );
}
