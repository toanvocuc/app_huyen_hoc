import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { BauTroiDong } from '@/components/bau-troi-dong';
import { Nut } from '@/components/nen';
import { NutDangNhap } from '@/components/nut-dang-nhap';
import { CHU, MAU } from '@/constants/giao-dien';
import { dangNhapApple, dangNhapGoogle, KhachHuy, loiDeHieu } from '@/lib/dang-nhap';
import { datCoHoSo, docHoSo } from '@/lib/ho-so';
import { dangNhapAnDanh } from '@/lib/supabase';

const { width: RONG, height: CAO } = Dimensions.get('window');

export default function DangNhap() {
  const [dangChay, setDangChay] = useState<'google' | 'apple' | 'an-danh' | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  async function thu(cach: 'google' | 'apple' | 'an-danh') {
    setLoi(null);
    setDangChay(cach);
    try {
      if (cach === 'google') await dangNhapGoogle();
      else if (cach === 'apple') await dangNhapApple();
      // true: chính khách bấm "Dùng ngay", nên tạo hồ sơ ẩn danh mới là đúng ý họ
      // kể cả khi máy này từng đăng nhập thật.
      else await dangNhapAnDanh(true);

      // Khách cũ đăng nhập lại ở máy mới thì hồ sơ đã nằm sẵn trên máy chủ.
      // Không đọc lại ở đây là bắt họ nhập lại năm bước và ghi đè lên hồ sơ cũ.
      const h = await docHoSo();
      const coHoSo = Boolean(h?.ngay_sinh);
      datCoHoSo(coHoSo);
      router.replace(coHoSo ? '/' : '/nhap-ho-so');
    } catch (e) {
      // Khách tự bấm huỷ thì im lặng quay về, đừng doạ người ta bằng chữ đỏ.
      if (!(e instanceof KhachHuy)) setLoi(loiDeHieu(e));
      setDangChay(null);
    }
  }

  return (
    <View className="flex-1 bg-nen">
      {/* Cùng dải ngân hà với màn chào mừng, để hai màn liền mạch. */}
      <Image
        source={require('@/assets/nen/ngan-ha.jpg')}
        style={{ position: 'absolute', top: 0, width: RONG, height: CAO * 0.62 }}
        contentFit="cover"
        contentPosition="top"
      />
      <LinearGradient
        colors={['transparent', 'rgba(11,18,32,0.6)', MAU.nen]}
        locations={[0, 0.48, 0.9]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: CAO * 0.62 }}
      />
      <BauTroiDong />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Logo đặt ở khoảng một phần ba trên, cho cân với mảng ngân hà.
            Dính sát đỉnh thì nửa trên màn hình trống hoác. */}
        <View className="flex-1 items-center justify-center">
          <Logo rong={132} />
        </View>

        <View className="px-8">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 38, lineHeight: 44 }}
            className="text-center text-chu-chinh">
            Giữ lại{'\n'}
            <Text style={{ color: MAU.vang }}>hồ sơ của bạn</Text>
          </Text>
        </View>

        <View className="px-8 pb-6 pt-9">
          <View className="gap-3">
            {/* Apple đặt trước trên iOS: quy định của họ là nút này phải nổi
                không kém bất kỳ cách đăng nhập nào khác. */}
            {Platform.OS === 'ios' ? (
              <NutDangNhap
                hang="apple"
                nhan="Đăng nhập bằng Apple"
                dangChay={dangChay === 'apple'}
                tat={dangChay !== null && dangChay !== 'apple'}
                onPress={() => thu('apple')}
              />
            ) : null}
            <NutDangNhap
              hang="google"
              nhan="Đăng nhập bằng Google"
              dangChay={dangChay === 'google'}
              tat={dangChay !== null && dangChay !== 'google'}
              onPress={() => thu('google')}
            />
          </View>

          <View className="my-5 flex-row items-center gap-3">
            <View style={{ backgroundColor: MAU.vien }} className="h-px flex-1" />
            <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-mo">
              hoặc
            </Text>
            <View style={{ backgroundColor: MAU.vien }} className="h-px flex-1" />
          </View>

          <Nut
            nhan="Dùng ngay, không cần tài khoản"
            kieu="vien"
            dangChay={dangChay === 'an-danh'}
            tat={dangChay !== null && dangChay !== 'an-danh'}
            onPress={() => thu('an-danh')}
          />

          {/* Đường của thầy, cố ý để nhẹ và nằm cuối. Khách không cần tới nó,
              mà để nổi ngang mấy nút kia thì khách bấm nhầm rồi loay hoay với
              một ô mật khẩu họ không có. */}
          <Pressable
            onPress={() => router.push('/dang-nhap-thay')}
            className="mt-6 self-center px-4 py-2 active:opacity-60">
            <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-mo underline">
              Tôi là chuyên gia của Omora
            </Text>
          </Pressable>

          {loi ? (
            <Text
              style={{ fontFamily: CHU.than }}
              className="mt-4 text-center text-sm leading-5 text-canh">
              {loi}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
