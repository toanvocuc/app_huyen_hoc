/**
 * Bầu trời sống: những vì sao xa nhấp nháy, và thi thoảng một đợt sao băng vụt
 * ngang nửa trên màn hình.
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
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { MAU } from '@/constants/giao-dien';

const { width: RONG, height: CAO } = Dimensions.get('window');

const SO_SAO = 16;
/** Sao băng chỉ bay ở nửa trên. Dưới đó là chỗ của chữ. */
const TRAN_BAY = CAO * 0.5;
const CHO_IT_NHAT = 10_000;
const CHO_NHIEU_NHAT = 35_000;
/** Mỗi đợt bay tối đa ba ngôi. */
const TOI_DA_MOT_DOT = 3;

/** Vàng sáng, cùng tông với mọi nét trang trí khác trong app. */
const MAU_SAO = MAU.vangSang;

/**
 * Ngôi sao bốn cánh.
 *
 * Không dùng sao năm cánh: ở cỡ vài pixel nó thành một cục mờ không rõ hình.
 * Bốn cánh nhọn và thưa nên nhỏ cỡ nào cũng còn nhận ra là ngôi sao.
 *
 * Nhỏ 4–8dp thôi. Độ nét do mật độ điểm ảnh của máy quyết định chứ không phải
 * số dp: máy 3x thì 4dp đã là 12 điểm ảnh thật, thừa chỗ để thấy bốn cánh.
 */
const DUONG_SAO =
  'M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z';

type ViSao = { x: number; y: number; co: number; nhip: number; tre: number };

function raiSao(): ViSao[] {
  return Array.from({ length: SO_SAO }, () => ({
    x: Math.random() * RONG,
    // Dồn về phía trên, nơi nền trời đậm nhất.
    y: Math.random() * CAO * 0.62,
    co: 4 + Math.random() * 4,
    nhip: 1400 + Math.random() * 2200,
    tre: Math.random() * 2600,
  }));
}

/** Một đường bay: vào từ mép này, ra ở mép kia, luôn chếch xuống. */
function veTuyen() {
  const traiSangPhai = Math.random() < 0.5;
  const dai = 110 + Math.random() * 90;
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
    // Chậm hơn hẳn bản đầu: bay vèo một cái thì khách chưa kịp nhìn đã hết.
    lau: 2000 + Math.random() * 1200,
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
      {dong ? <DotSaoBang /> : null}
    </View>
  );
}

function SaoNhay({ x, y, co, nhip, tre, dong }: ViSao & { dong: boolean }) {
  const sang = useSharedValue(0.4);

  useEffect(() => {
    if (!dong) {
      cancelAnimation(sang);
      sang.value = 0.5;
      return;
    }
    // Tự lặp bằng hàm gọi lại thay vì withRepeat, để mỗi vòng lấy một quãng
    // nghỉ khác nhau — nhấp nháy đều tăm tắp thì giống đèn báo hơn giống sao.
    let song = true;
    const mo = () => {
      if (!song) return;
      sang.value = withTiming(1, { duration: nhip, easing: Easing.inOut(Easing.quad) }, () => {
        if (!song) return;
        sang.value = withTiming(0.3, { duration: nhip * 1.2, easing: Easing.inOut(Easing.quad) });
      });
    };
    sang.value = withDelay(tre, withTiming(0.3, { duration: 1 }));
    const nhipTay = setInterval(mo, nhip * 2.4);
    const batDau = setTimeout(mo, tre);

    return () => {
      song = false;
      clearInterval(nhipTay);
      clearTimeout(batDau);
      cancelAnimation(sang);
    };
  }, [dong, nhip, tre, sang]);

  const kieu = useAnimatedStyle(() => ({
    opacity: sang.value * 0.95,
    transform: [{ scale: 0.7 + sang.value * 0.5 }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y }, kieu]}>
      <Svg width={co} height={co} viewBox="0 0 24 24">
        <Path d={DUONG_SAO} fill={MAU_SAO} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Một đợt sao băng: một tới ba ngôi, lệch nhau một chút.
 *
 * Bay cùng lúc thì trông như hiệu ứng máy móc. Lệch vài trăm mili giây là mắt
 * đọc ra thành một đàn, tự nhiên hơn hẳn.
 */
function DotSaoBang() {
  const [lan, datLan] = useState(0);
  const [so, datSo] = useState(1);
  const hen = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let song = true;

    function datLich() {
      const cho = CHO_IT_NHAT + Math.random() * (CHO_NHIEU_NHAT - CHO_IT_NHAT);
      hen.current = setTimeout(() => {
        if (!song) return;
        datSo(1 + Math.floor(Math.random() * TOI_DA_MOT_DOT));
        datLan((n) => n + 1);
        datLich();
      }, cho);
    }
    datLich();

    return () => {
      song = false;
      if (hen.current) clearTimeout(hen.current);
    };
  }, []);

  return (
    <>
      {Array.from({ length: TOI_DA_MOT_DOT }, (_, i) => (
        <MotSaoBang key={i} lan={lan} bay={i < so} thuTu={i} />
      ))}
    </>
  );
}

function MotSaoBang({ lan, bay, thuTu }: { lan: number; bay: boolean; thuTu: number }) {
  const [tuyen, datTuyen] = useState(veTuyen);
  const tien = useSharedValue(0);

  useEffect(() => {
    if (lan === 0 || !bay) return;
    const t = veTuyen();
    datTuyen(t);
    tien.value = 0;
    tien.value = withDelay(
      // Ngôi sau chờ ngôi trước một nhịp ngắn.
      thuTu * (180 + Math.random() * 320),
      withTiming(1, { duration: t.lau, easing: Easing.linear })
    );
    return () => cancelAnimation(tien);
  }, [lan, bay, thuTu, tien]);

  const kieu = useAnimatedStyle(() => ({
    opacity: interpolate(tien.value, [0, 0.12, 0.78, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: interpolate(tien.value, [0, 1], [tuyen.x1, tuyen.x2]) },
      { translateY: interpolate(tien.value, [0, 1], [tuyen.y1, tuyen.y2]) },
      { rotate: `${tuyen.goc}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[{ position: 'absolute', left: 0, top: 0, flexDirection: 'row', alignItems: 'center' }, kieu]}>
      {/* Vệt sáng nhạt dần về đuôi... */}
      <LinearGradient
        colors={['transparent', 'rgba(212,168,75,0.45)', 'rgba(232,198,115,0.95)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: tuyen.dai, height: 2, borderRadius: 2 }}
      />
      {/* ...và một ngôi sao nhỏ ở đầu vệt, để nhận ra ngay là sao băng. */}
      <View style={{ marginLeft: -3 }}>
        <Svg width={9} height={9} viewBox="0 0 24 24">
          <Path d={DUONG_SAO} fill={MAU_SAO} />
        </Svg>
      </View>
    </Animated.View>
  );
}
