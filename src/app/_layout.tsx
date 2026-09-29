import '@/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { dangNhapAnDanh } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [sanSang, setSanSang] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    // Hồ sơ ẩn danh tạo ngay lần mở đầu tiên, khách không phải bấm gì.
    dangNhapAnDanh()
      .catch((e) => setLoi(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        setSanSang(true);
        SplashScreen.hideAsync();
      });
  }, []);

  if (!sanSang) {
    return (
      <View className="flex-1 items-center justify-center bg-nen">
        <ActivityIndicator color="#C9A227" />
      </View>
    );
  }

  if (loi) {
    return (
      <View className="flex-1 items-center justify-center bg-nen px-8">
        <Text className="mb-2 text-center text-lg font-semibold text-chu-chinh">
          Chưa nối được máy chủ
        </Text>
        <Text className="text-center text-sm text-chu-phu">{loi}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
