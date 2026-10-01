import '@/global.css';

import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
} from '@expo-google-fonts/be-vietnam-pro';
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { MAU } from '@/constants/giao-dien';
import { datCoHoSo, docHoSo, ngheCoHoSo } from '@/lib/ho-so';
import { dangNhapAnDanh } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [xong, setXong] = useState(false);
  const [coHoSo, setCoHoSo] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const doan = useSegments();
  const [phongXong] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  useEffect(() => {
    // Hồ sơ ẩn danh tạo ngay lần mở đầu tiên, khách không phải bấm gì.
    dangNhapAnDanh()
      .then(docHoSo)
      .then((h) => {
        const co = Boolean(h?.ngay_sinh);
        setCoHoSo(co);
        datCoHoSo(co);
      })
      .catch((e) => setLoi(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        setXong(true);
        SplashScreen.hideAsync();
      });
  }, []);

  // Nhập hồ sơ xong thì ho-so.ts báo lại, nhờ vậy không bị đá ngược về phần nhập.
  useEffect(() => ngheCoHoSo(setCoHoSo), []);

  useEffect(() => {
    if (!xong || !phongXong || loi) return;
    const dangNhapLieu = doan[0] === 'nhap-ho-so';
    if (!coHoSo && !dangNhapLieu) router.replace('/nhap-ho-so');
  }, [xong, phongXong, loi, coHoSo, doan]);

  if (!xong || !phongXong) {
    return (
      <View className="flex-1 items-center justify-center bg-nen">
        <ActivityIndicator color={MAU.vang} />
      </View>
    );
  }

  if (loi) {
    return (
      <View className="flex-1 items-center justify-center bg-nen px-8">
        <Text className="mb-2 text-center text-lg font-semibold text-chu-chinh">
          Chưa nối được máy chủ
        </Text>
        <Text className="text-center text-sm leading-5 text-chu-phu">{loi}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: MAU.nen } }} />
    </>
  );
}
