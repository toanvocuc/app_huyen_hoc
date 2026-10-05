/** Nút lùi: bàn tay chỉ về phía sau, nhún lên xuống và lấp lánh. */

import { router } from 'expo-router';
import { useEffect, useId, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { CHU, MAU } from '@/constants/giao-dien';

/**
 * Bàn tay chỉ sang trái, lấy từ glyph hand-o-left của FontAwesome rồi chuẩn hoá
 * về khung 100x100. Để thẳng đường dẫn ở đây chứ không nhúng cả bộ phông
 * FontAwesome 165 KB vào app chỉ để lấy đúng một ký tự.
 */
const DUONG_TAY =
  'M76.79 78.57H78.57V42.86H76.79Q74.83 42.86 73.02 42.19Q71.21 41.52 69.53 40.12Q67.86 38.73 66.74 37.56Q65.62 36.38 64.01 34.54Q63.56 34.04 63.34 33.76Q59.32 29.24 57.09 25.67Q56.31 24.44 54.97 21.88Q54.91 21.71 54.38 20.62Q53.85 19.53 53.35 18.61Q52.85 17.69 52.23 16.63Q51.62 15.57 51.03 14.93Q50.45 14.29 50.00 14.29Q46.04 14.29 43.55 15.99Q41.07 17.69 41.07 21.43Q41.07 23.83 41.91 26.14Q42.75 28.46 43.75 29.94Q44.75 31.42 45.59 33.01Q46.43 34.60 46.43 35.71H14.29Q11.50 35.71 9.32 37.86Q7.14 40.01 7.14 42.86Q7.14 45.76 9.26 47.88Q11.38 50.00 14.29 50.00H32.76Q31.92 50.95 31.36 52.65Q30.80 54.35 30.80 55.75Q30.80 59.60 33.76 62.39Q32.76 64.17 32.76 66.24Q32.76 68.30 33.73 70.34Q34.71 72.38 36.38 73.27Q36.16 74.61 36.16 76.40Q36.16 81.14 38.87 83.43Q41.57 85.71 46.43 85.71Q51.12 85.71 56.64 83.93Q62.17 82.14 67.47 80.36Q72.77 78.57 76.79 78.57ZM91.80 77.51Q92.86 76.45 92.86 75.00Q92.86 73.55 91.80 72.49Q90.74 71.43 89.29 71.43Q87.83 71.43 86.77 72.49Q85.71 73.55 85.71 75.00Q85.71 76.45 86.77 77.51Q87.83 78.57 89.29 78.57Q90.74 78.57 91.80 77.51ZM100.00 42.86V78.57Q100.00 81.53 97.91 83.62Q95.81 85.71 92.86 85.71H76.79Q73.49 85.71 64.34 89.01Q53.74 92.86 46.65 92.86Q38.73 92.86 33.82 88.53Q28.91 84.21 28.96 76.40L29.02 76.12Q25.61 71.88 25.61 66.18Q25.61 64.96 25.78 63.78Q23.94 60.60 23.72 57.14H14.29Q8.43 57.14 4.21 52.90Q0.00 48.66 0.00 42.80Q0.00 37.05 4.24 32.81Q8.48 28.57 14.29 28.57H35.16Q33.93 25.22 33.93 21.43Q33.93 14.62 38.48 10.88Q43.02 7.14 50.00 7.14Q52.12 7.14 53.88 8.12Q55.64 9.10 56.95 10.88Q58.26 12.67 59.21 14.40Q60.16 16.13 61.27 18.42Q62.39 20.70 63.11 21.88Q65.07 24.94 68.69 29.07Q68.81 29.24 69.48 30.02Q70.15 30.80 70.54 31.22Q70.93 31.64 71.68 32.42Q72.43 33.20 73.02 33.68Q73.60 34.15 74.27 34.68Q74.94 35.21 75.59 35.46Q76.23 35.71 76.79 35.71H92.86Q95.81 35.71 97.91 37.81Q100.00 39.90 100.00 42.86Z';

/** Ngôi sao bốn cánh, hình quen thuộc của một tia lấp lánh. */
const DUONG_TIA =
  'M50 0C52.4 35.2 64.8 47.6 100 50C64.8 52.4 52.4 64.8 50 100C47.6 64.8 35.2 52.4 0 50C35.2 47.6 47.6 35.2 50 0Z';

const CO_TAY = 26;
/** Khung chứa cả bàn tay lẫn mấy tia sáng quanh nó. */
const KHUNG = 38;

/**
 * Mỗi tia một nhịp và một độ trễ riêng. Để cùng nhịp thì ba tia sáng tắt một
 * lượt, trông như đèn nháy chứ không ra lấp lánh.
 */
const TIA = [
  { x: 25.5, y: 1.5, co: 11, tre: 0, nhip: 1450 },
  { x: 1, y: 8, co: 7.5, tre: 560, nhip: 1900 },
  { x: 28, y: 25, co: 6.5, tre: 1080, nhip: 1250 },
];

function Tia({ x, y, co, tre, nhip }: (typeof TIA)[number]) {
  const v = useSharedValue(0);
  const dungNhay = useReducedMotion();

  useEffect(() => {
    // Máy bật chế độ giảm chuyển động thì để tia đứng yên ở độ sáng vừa phải.
    if (dungNhay) {
      v.value = 0.6;
      return;
    }
    v.value = withDelay(
      tre,
      withRepeat(withTiming(1, { duration: nhip, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
  }, [v, tre, nhip, dungNhay]);

  const kieu = useAnimatedStyle(() => ({
    opacity: 0.12 + v.value * 0.88,
    transform: [{ scale: 0.4 + v.value * 0.8 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: x, top: y, width: co, height: co }, kieu]}>
      <Svg width={co} height={co} viewBox="0 0 100 100">
        <Path d={DUONG_TIA} fill={MAU.vangSang} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Quầng vàng mờ thở ra thở vào sau bàn tay.
 *
 * Vẽ bằng SVG chứ không dùng `shadowColor`: bóng có màu chỉ chạy trên iOS và
 * web, Android đổ bóng đen theo `elevation` nên ở đó sẽ không thấy gì.
 */
function Quang() {
  const ma = useId();
  const v = useSharedValue(0);
  const dungNhay = useReducedMotion();

  useEffect(() => {
    if (dungNhay) {
      v.value = 0.5;
      return;
    }
    v.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [v, dungNhay]);

  const kieu = useAnimatedStyle(() => ({ opacity: 0.22 + v.value * 0.42 }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 0, top: 0, width: KHUNG, height: KHUNG }, kieu]}>
      <Svg width={KHUNG} height={KHUNG} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={`quang-tay-${ma}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={MAU.vangSang} stopOpacity="0.38" />
            <Stop offset="0.42" stopColor={MAU.vang} stopOpacity="0.13" />
            <Stop offset="1" stopColor={MAU.vang} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#quang-tay-${ma})`} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Nút lùi dùng chung cho cả app.
 *
 * Trước đây mỗi màn tự vẽ một mũi tên xám trần, không viền không chữ, người
 * dùng không nhận ra đó là nút bấm. Bàn tay nhún nhẹ và lấp lánh để mắt bắt
 * được ngay, kèm chữ ở chỗ nào còn rộng.
 *
 * @param chu Có kèm chữ "Quay lại" hay không. Tắt khi chỗ đặt quá hẹp, ví dụ
 *   bên cạnh tên màn căn giữa ở thanh tiêu đề.
 */
export function NutQuayLai({ chu = true }: { chu?: boolean }) {
  const nhun = useSharedValue(0);
  const dungNhay = useReducedMotion();
  /**
   * Quầng sáng và ba tia chỉ dựng sau khi màn đã hiện xong.
   *
   * Nút này nằm ở gần như mọi màn. Dựng năm hình SVG ngay lúc màn đang mở ra
   * làm cú chuyển màn khựng lại trên máy yếu, khách tưởng nút chưa ăn nên bấm
   * thêm lần nữa. Bàn tay vẫn hiện ngay, chỉ phần trang trí tới sau.
   */
  const [daMo, setDaMo] = useState(false);

  useEffect(() => {
    const h = setTimeout(() => setDaMo(true), 280);
    return () => clearTimeout(h);
  }, []);

  useEffect(() => {
    if (dungNhay) return;
    nhun.value = withRepeat(
      withTiming(1, { duration: 1150, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [nhun, dungNhay]);

  // Nhún vừa đủ thấy. Biên lớn hơn thì cả thanh tiêu đề trông như bị rung.
  const kieuNhun = useAnimatedStyle(() => ({ transform: [{ translateY: -2.5 + nhun.value * 5 }] }));

  return (
    <Pressable
      // Mở app thẳng từ thông báo đẩy thì không có màn trước để lùi. Gọi thẳng
      // back() lúc đó là bấm nút không có gì xảy ra.
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Quay lại"
      style={{ borderColor: MAU.vangMo, backgroundColor: MAU.vangRatMo, minHeight: 48 }}
      className={`flex-row items-center self-start rounded-full border active:opacity-60 ${
        chu ? 'gap-1 pl-1.5 pr-4' : 'justify-center px-1.5'
      }`}>
      <Animated.View style={[{ width: KHUNG, height: KHUNG }, kieuNhun]}>
        {daMo ? <Quang /> : null}
        <View style={{ position: 'absolute', left: (KHUNG - CO_TAY) / 2, top: (KHUNG - CO_TAY) / 2 }}>
          <Svg width={CO_TAY} height={CO_TAY} viewBox="0 0 100 100">
            <Path d={DUONG_TAY} fill={MAU.vang} />
          </Svg>
        </View>
        {daMo
          ? TIA.map((t) => <Tia key={`${t.x}-${t.y}`} {...t} />)
          : null}
      </Animated.View>
      {chu ? (
        <Text style={{ fontFamily: CHU.thanVua, color: MAU.vang }} className="text-sm">
          Quay lại
        </Text>
      ) : null}
    </Pressable>
  );
}
