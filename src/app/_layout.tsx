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
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';
import { datCoHoSo, docHoSo, ngheCoHoSo } from '@/lib/ho-so';
import { batHienKhiDangMo } from '@/lib/thong-bao';
import { dangNhapAnDanh } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

// Khai một lần lúc nạp app, trước khi vẽ gì. Khai bên trong component thì thông
// báo nổ trước lúc component đó dựng xong sẽ vẫn bị nuốt.
batHienKhiDangMo();

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

  // Hồ sơ ẩn danh tạo ngay lần mở đầu tiên, khách không phải bấm gì.
  const khoiDong = useCallback(() => {
    setLoi(null);
    setXong(false);
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

  useEffect(khoiDong, [khoiDong]);

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
        <Text style={{ fontFamily: CHU.thanDam }} className="mb-2 text-center text-lg text-chu-chinh">
          Chưa nối được máy chủ
        </Text>
        <Text
          style={{ fontFamily: CHU.than }}
          className="text-center text-sm leading-5 text-chu-phu">
          {loi}
        </Text>

        {/* Không có nút này thì mất mạng lúc mở app là khách kẹt luôn ở màn này,
            phải thoát hẳn app rồi mở lại mới thử lại được. */}
        <Pressable
          onPress={khoiDong}
          className="mt-7 rounded-xl bg-vang px-7 py-3 active:opacity-80">
          <Text style={{ fontFamily: CHU.thanDam }} className="text-center text-nen">
            Thử lại
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: MAU.nen },
          // Mờ dần thay vì trượt ngang. Trượt làm màn mới xô màn cũ đi, hợp với
          // app công cụ; app này toàn nền trời sao nên mờ dần liền mạch hơn, và
          // chùm sao bắn ra lúc bấm còn kịp cháy hết trong lúc màn cũ nhạt đi.
          animation: 'fade',
          animationDuration: 220,
        }}
      />
    </>
  );
}
