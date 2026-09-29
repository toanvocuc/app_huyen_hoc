/** Màn rút bài: xoè bài thành vòng cung, chạm chọn, lật lên rồi sang màn kết quả. */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatSau, VanNen } from '@/components/mat-sau';
import { DangTai, VanNgan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { useBoBai } from '@/lib/kho-noi-dung';
import { datPhien } from '@/lib/phien-rut';
import { rutBai, VI_TRI, type KieuTrai, type LaDaRut } from '@/lib/tarot';

const SO_LA = 13;
const RONG_MAN = Dimensions.get('window').width;
const RONG_LA = Math.min(78, RONG_MAN * 0.2);

// Xoè bài: tính theo bước ngang cố định rồi cong lên bằng một đường parabol.
// Dễ canh cho vừa màn hình hơn là tính theo bán kính vòng tròn.
const LE_HAI_BEN = 14;
const BUOC = (RONG_MAN - RONG_LA - LE_HAI_BEN * 2) / (SO_LA - 1);
const DO_CONG = 44; // lá ngoài cùng tụt xuống bao nhiêu điểm ảnh
const GOC_NGOAI = 22; // độ nghiêng của lá ngoài cùng

export default function RutBai() {
  const { kieu = 'mot-la', cauHoi = '' } = useLocalSearchParams<{
    kieu: KieuTrai;
    cauHoi: string;
  }>();
  const { boBai, dangTai } = useBoBai();

  const canRut = VI_TRI[kieu as KieuTrai]?.length ?? 1;
  const [daChon, setDaChon] = useState<number[]>([]);
  const [dangLat, setDangLat] = useState(false);
  const lat = useSharedValue(0);

  // Rút sẵn ngay khi vào màn, để bấm hai lần không ra kết quả khác nhau.
  const ketQua = useMemo<LaDaRut[] | null>(
    () => (boBai?.length ? rutBai(boBai, kieu as KieuTrai) : null),
    [boBai, kieu]
  );

  function chon(i: number) {
    if (dangLat || daChon.includes(i)) return;
    const moi = [...daChon, i];
    setDaChon(moi);
    if (moi.length < canRut) return;

    setDangLat(true);
    lat.value = withTiming(1, { duration: 800 }, (xong) => {
      if (xong) runOnJS(sangKetQua)();
    });
  }

  function sangKetQua() {
    if (!ketQua) return;
    datPhien(ketQua, String(cauHoi));
    router.replace('/tarot/ket-qua');
  }

  const kieuLat = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${lat.value * 180}deg` }],
    opacity: 1 - lat.value * 0.3,
  }));

  if (dangTai || !ketQua) {
    return (
      <View className="flex-1 bg-nen">
        <DangTai />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-nen">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={14}
          style={{ borderColor: MAU.vien }}
          className="ml-5 mt-2 h-10 w-10 items-center justify-center rounded-full border active:opacity-60">
          <Ionicons name="chevron-back" size={20} color={MAU.chuPhu} />
        </Pressable>

        <View className="mt-6 px-8">
          <Text
            style={{ fontFamily: CHU.than, fontSize: 16 }}
            className="text-center text-chu-chinh">
            {dangLat ? 'Đang lật bài' : canRut === 1 ? 'Chạm để chọn một lá' : 'Chạm để chọn ba lá'}
          </Text>
          <VanNgan />
        </View>

        {/* Hoa văn la bàn lớn làm nền, nằm sau bộ bài */}
        <View className="flex-1 items-center justify-center">
          <View pointerEvents="none" className="absolute">
            <VanNen cỡ={RONG_MAN * 0.95} />
          </View>

          <View style={{ height: RONG_LA / 0.57 + 70, width: '100%' }} className="items-center justify-center">
            {Array.from({ length: SO_LA }).map((_, i) => {
              const giua = (SO_LA - 1) / 2;
              const lech = (i - giua) / giua; // -1 ở mép trái, 0 giữa, 1 ở mép phải
              const chonRoi = daChon.includes(i);
              const mo = daChon.length > 0 && !chonRoi;

              return (
                <Pressable
                  key={i}
                  onPress={() => chon(i)}
                  disabled={dangLat}
                  style={{
                    position: 'absolute',
                    transform: [
                      { translateX: (i - giua) * BUOC },
                      { translateY: lech * lech * DO_CONG - (chonRoi ? 36 : 0) },
                      { rotate: `${lech * GOC_NGOAI}deg` },
                    ],
                    opacity: mo ? 0.42 : 1,
                    zIndex: chonRoi ? 50 : i,
                  }}>
                  <Animated.View style={chonRoi ? kieuLat : undefined}>
                    <View
                      style={
                        chonRoi
                          ? {
                              borderRadius: 9,
                              borderWidth: 2.5,
                              borderColor: MAU.vangSang,
                              shadowColor: MAU.vang,
                              shadowOpacity: 0.85,
                              shadowRadius: 16,
                              shadowOffset: { width: 0, height: 0 },
                              elevation: 14,
                            }
                          : undefined
                      }>
                      <MatSau rong={RONG_LA} />
                    </View>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {canRut > 1 && !dangLat ? (
          <View className="items-center pb-4">
            <View
              style={{ borderColor: MAU.vien }}
              className="rounded-full border bg-nen-nhat px-6 py-2.5">
              <Text style={{ fontFamily: CHU.thanVua }} className="text-sm text-chu-phu">
                Đã chọn {daChon.length} / {canRut}
              </Text>
            </View>
          </View>
        ) : null}

        <Text
          style={{ fontFamily: CHU.than }}
          className="px-10 pb-4 text-center text-[11px] leading-4 text-chu-mo">
          Lá bài được chọn ngẫu nhiên bằng bộ sinh số của hệ điều hành
        </Text>
      </SafeAreaView>
    </View>
  );
}
