import '@/global.css';

import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { MAU } from '@/constants/giao-dien';
import { docHoSo } from '@/lib/ho-so';
import { dangNhapAnDanh } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [xong, setXong] = useState(false);
  const [coHoSo, setCoHoSo] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const doan = useSegments();

  useEffect(() => {
    // Hồ sơ ẩn danh tạo ngay lần mở đầu tiên, khách không phải bấm gì.
    dangNhapAnDanh()
      .then(docHoSo)
      .then((h) => setCoHoSo(Boolean(h?.ngay_sinh)))
      .catch((e) => setLoi(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        setXong(true);
        SplashScreen.hideAsync();
      });
  }, []);

  useEffect(() => {
    if (!xong || loi) return;
    const dangNhapLieu = doan[0] === 'nhap-ho-so';
    if (!coHoSo && !dangNhapLieu) router.replace('/nhap-ho-so');
  }, [xong, loi, coHoSo, doan]);

  if (!xong) {
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
