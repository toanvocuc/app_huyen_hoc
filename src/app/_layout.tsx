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
import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

SplashScreen.preventAutoHideAsync();

// Khai một lần lúc nạp app, trước khi vẽ gì. Khai bên trong component thì thông
// báo nổ trước lúc component đó dựng xong sẽ vẫn bị nuốt.
batHienKhiDangMo();

export default function RootLayout() {
  const [xong, setXong] = useState(false);
  const [coHoSo, setCoHoSo] = useState(false);
  const [coPhien, setCoPhien] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const doan = useSegments();
  const [phongXong] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  /**
   * Mở app thì chỉ ĐỌC xem đã có phiên chưa, không tạo gì cả.
   *
   * Trước đây chỗ này tự tạo tài khoản ẩn danh ngay lần mở đầu. Làm vậy thì
   * khách không bao giờ được hỏi, và người muốn đăng nhập thật để hồ sơ theo
   * được sang máy khác thì đã lỡ mang một tài khoản ẩn danh rồi.
   */
  const khoiDong = useCallback(() => {
    setLoi(null);
    setXong(false);
    (XEM_THU
      ? Promise.resolve(true)
      : supabase.auth.getSession().then(({ data }) => Boolean(data.session))
    )
      .then(async (co) => {
        setCoPhien(co);
        return co ? docHoSo() : null;
      })
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

  // Màn đăng nhập tạo phiên xong thì báo về đây, nhờ vậy không bị đá ngược ra.
  // Nghe thẳng Supabase chứ không tự gọi lại, vì cách này bắt được cả lúc đăng
  // xuất lẫn lúc phiên hết hạn.
  useEffect(() => {
    if (XEM_THU) return;
    const { data } = supabase.auth.onAuthStateChange((_, phien) => setCoPhien(Boolean(phien)));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!xong || !phongXong || loi) return;
    const dau = doan[0];
    // Chưa có phiên thì phải chọn cách vào trước, chưa bàn tới hồ sơ.
    if (!coPhien) {
      if (dau !== 'dang-nhap') router.replace('/dang-nhap');
      return;
    }
    if (!coHoSo && dau !== 'nhap-ho-so') router.replace('/nhap-ho-so');
  }, [xong, phongXong, loi, coPhien, coHoSo, doan]);

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
