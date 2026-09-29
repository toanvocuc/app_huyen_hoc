/** Màn rút bài: chạm chọn lá úp, lật lên, rồi sang màn kết quả. */

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

import { MatSau } from '@/components/la-bai';
import { DangTai } from '@/components/nen';
import { useBoBai } from '@/lib/kho-noi-dung';
import { datPhien } from '@/lib/phien-rut';
import { rutBai, VI_TRI, type KieuTrai, type LaDaRut } from '@/lib/tarot';

const SO_LA_XOE = 11;
const RONG_MAN = Dimensions.get('window').width;

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

  // Rút sẵn ngay khi vào màn. Lá nào ứng với ô nào không quan trọng,
  // nhưng phải cố định để bấm hai lần không ra kết quả khác nhau.
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
    lat.value = withTiming(1, { duration: 700 }, (xong) => {
      if (xong) runOnJS(sangKetQua)();
    });
  }

  function sangKetQua() {
    if (!ketQua) return;
    datPhien(ketQua, String(cauHoi));
    router.replace('/tarot/ket-qua');
  }

  const kieuLat = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${lat.value * 180}deg` }],
    opacity: 1 - lat.value * 0.35,
  }));

  if (dangTai || !ketQua) {
    return (
      <SafeAreaView className="flex-1 bg-nen">
        <DangTai />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-nen">
      <Pressable
        onPress={() => router.back()}
        hitSlop={14}
        className="ml-4 mt-2 h-9 w-9 items-center justify-center active:opacity-60">
        <Text className="text-2xl text-chu-phu">×</Text>
      </Pressable>

      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-center text-base leading-6 text-chu-phu">
          {dangLat
            ? 'Đang lật bài…'
            : canRut === 1
              ? 'Chạm để chọn một lá'
              : 'Chạm để chọn ba lá'}
        </Text>
        {canRut > 1 && !dangLat ? (
          <Text className="mt-2 text-sm text-vang">
            Đã chọn {daChon.length} / {canRut}
          </Text>
        ) : null}

        <View className="mt-12 h-[230px] w-full items-center justify-center">
          {Array.from({ length: SO_LA_XOE }).map((_, i) => {
            const giua = (SO_LA_XOE - 1) / 2;
            const lech = i - giua;
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
                    { translateX: lech * (RONG_MAN * 0.055) },
                    { translateY: chonRoi ? -26 : Math.abs(lech) * 4 },
                    { rotate: `${lech * 4}deg` },
                  ],
                  opacity: mo ? 0.3 : 1,
                  zIndex: chonRoi ? 20 : i,
                }}>
                <Animated.View style={chonRoi ? kieuLat : undefined}>
                  <MatSau rong={96} />
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text className="px-8 pb-8 text-center text-xs leading-5 text-chu-mo">
        Lá bài được chọn ngẫu nhiên bằng bộ sinh số của hệ điều hành
      </Text>
    </SafeAreaView>
  );
}
