/**
 * Bầu trời sống: những vì sao xa nhấp nháy, và thi thoảng một ngôi sao băng
 * vụt ngang nửa trên màn hình.
 *
 * Ba thứ giữ cho nó không thành gánh nặng:
 *
 *  1. **Ngủ khi không ai nhìn.** Màn hình mất tiêu điểm là dừng hẳn. Thiếu điều
 *     này thì hiệu ứng vẫn chạy lúc khách đang ở tab khác, đốt pin cho không ai.
 *  2. **Tôn trọng cài đặt giảm chuyển động.** Người bị say chuyển động bật mục
 *     đó trong cài đặt máy; lúc ấy sao vẫn vẽ nhưng đứng yên.
 *  3. **Ít sao.** Mười sáu ngôi là đủ dày để thấy lấp lánh. Nhiều hơn thì máy
 *     yếu bắt đầu khựng mà mắt cũng chẳng nhận ra khác biệt.
 *
 * Mọi chuyển động chạy bằng reanimated nên nằm ở luồng giao diện, không đụng
 * tới luồng JavaScript — app vẫn mượt khi đang tải dữ liệu.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: RONG, height: CAO } = Dimensions.get('window');

const SO_SAO = 16;
/** Sao băng chỉ bay ở nửa trên. Dưới đó là chỗ của chữ. */
const TRAN_BAY = CAO * 0.5;
const CHO_IT_NHAT = 10_000;
const CHO_NHIEU_NHAT = 35_000;

type ViSao = { x: number; y: number; co: number; nhip: number; tre: number };

function raiSao(): ViSao[] {
  return Array.from({ length: SO_SAO }, () => ({
    x: Math.random() * RONG,
    // Dồn về phía trên, nơi nền trời đậm nhất.
    y: Math.random() * CAO * 0.62,
    co: 1.4 + Math.random() * 1.8,
    nhip: 1400 + Math.random() * 2200,
    tre: Math.random() * 2600,
  }));
}

/** Một đường bay: vào từ mép này, ra ở mép kia, luôn chếch xuống. */
function veTuyen() {
  const traiSangPhai = Math.random() < 0.5;
  const dai = 90 + Math.random() * 70;
  // Góc chếch 18–34 độ. Dốc hơn thì giống sao rơi, thoải hơn thì giống vệt máy bay.
  const doc = (18 + Math.random() * 16) * (Math.PI / 180);
  const batDauY = Math.random() * TRAN_BAY * 0.55;
  const chay = RONG + dai * 2;

  return {
    x1: traiSangPhai ? -dai : RONG + dai,
    x2: traiSangPhai ? RONG + dai : -dai,
    y1: batDauY,
    y2: batDauY + Math.sin(doc) * chay,
    goc: (traiSangPhai ? doc : Math.PI - doc) * (180 / Math.PI),
    dai,
    lau: 850 + Math.random() * 500,
  };
}

export function BauTroiDong() {
  // Dùng useFocusEffect của expo-router chứ không kéo thêm @react-navigation vào
  // làm phụ thuộc trực tiếp — thư viện đó đã nằm sẵn bên dưới expo-router rồi.
  const [hienRa, datHienRa] = useState(false);
  useFocusEffect(
    useCallback(() => {
      datHienRa(true);
      return () => datHienRa(false);
    }, [])
  );

  const giamChuyenDong = useReducedMotion();
  const sao = useMemo(raiSao, []);
  const dong = hienRa && !giamChuyenDong;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
      {sao.map((s, i) => (
        <SaoNhay key={i} {...s} dong={dong} />
      ))}
      {dong ? <SaoBang /> : null}
    </View>
  );
}

function SaoNhay({ x, y, co, nhip, tre, dong }: ViSao & { dong: boolean }) {
  const sang = useSharedValue(0.35);

  useEffect(() => {
    if (!dong) {
      cancelAnimation(sang);
      sang.value = 0.45;
      return;
    }
    sang.value = withDelay(
      tre,
      withRepeat(withTiming(1, { duration: nhip, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
    return () => cancelAnimation(sang);
  }, [dong, nhip, tre, sang]);

  const kieu = useAnimatedStyle(() => ({
    opacity: sang.value * 0.9,
    transform: [{ scale: 0.75 + sang.value * 0.45 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: co,
          height: co,
          borderRadius: co,
          backgroundColor: '#FFF7E3',
        },
        kieu,
      ]}
    />
  );
}

function SaoBang() {
  const [tuyen, datTuyen] = useState(veTuyen);
  const tien = useSharedValue(0);
  const hen = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let song = true;

    function datLich() {
      const cho = CHO_IT_NHAT + Math.random() * (CHO_NHIEU_NHAT - CHO_IT_NHAT);
      hen.current = setTimeout(() => {
        if (!song) return;
        const t = veTuyen();
        datTuyen(t);
        tien.value = 0;
        tien.value = withTiming(1, { duration: t.lau, easing: Easing.linear });
        datLich();
      }, cho);
    }
    datLich();

    return () => {
      song = false;
      if (hen.current) clearTimeout(hen.current);
      cancelAnimation(tien);
    };
  }, [tien]);

  const kieu = useAnimatedStyle(() => ({
    opacity: interpolate(tien.value, [0, 0.12, 0.78, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: interpolate(tien.value, [0, 1], [tuyen.x1, tuyen.x2]) },
      { translateY: interpolate(tien.value, [0, 1], [tuyen.y1, tuyen.y2]) },
      { rotate: `${tuyen.goc}deg` },
    ],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, kieu]}>
      {/* Vệt sáng nhạt dần về đuôi, đầu sáng nhất ở bên phải. */}
      <LinearGradient
        colors={['transparent', 'rgba(255,247,227,0.55)', '#FFFFFF']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: tuyen.dai, height: 2, borderRadius: 2 }}
      />
    </Animated.View>
  );
}
