import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Nut } from '@/components/nen';
import { NutDangNhap } from '@/components/nut-dang-nhap';
import { CHU, MAU } from '@/constants/giao-dien';
import { dangNhapApple, dangNhapGoogle } from '@/lib/dang-nhap';
import { dangNhapAnDanh } from '@/lib/supabase';

const { width: RONG, height: CAO } = Dimensions.get('window');

/**
 * Ba điều đăng nhập đổi được cho khách.
 *
 * Chỉ hứa đúng thứ app làm được thật. Cả ba đều đúng vì hồ sơ và lịch sử rút
 * bài nằm trên máy chủ, khoá theo tài khoản: đăng nhập lại ở máy nào cũng đọc
 * đúng dữ liệu đó. Đừng thêm dòng nào về sao lưu hay mua bán khi chưa có.
 */
const LOI_ICH = [
  'Đổi máy hay cài lại app, hồ sơ vẫn còn nguyên',
  'Xem lại mọi lần rút bài trước đây',
  'Một hồ sơ dùng chung trên nhiều máy',
];

export default function DangNhap() {
  const [dangChay, setDangChay] = useState<'google' | 'apple' | 'an-danh' | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  async function thu(cach: 'google' | 'apple' | 'an-danh') {
    setLoi(null);
    setDangChay(cach);
    try {
      if (cach === 'google') await dangNhapGoogle();
      else if (cach === 'apple') await dangNhapApple();
      else await dangNhapAnDanh();
      router.replace('/nhap-ho-so');
    } catch (e) {
      setLoi(e instanceof Error ? e.message : 'Chưa đăng nhập được, thử lại giúp tôi');
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

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View className="items-center pt-8">
          <Logo rong={118} />
        </View>

        <View className="flex-1" />

        <View className="px-8">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 38, lineHeight: 44 }}
            className="text-center text-chu-chinh">
            Giữ lại{'\n'}
            <Text style={{ color: MAU.vang }}>hồ sơ của bạn</Text>
          </Text>

          <View className="mx-auto mt-6 max-w-[320px] gap-2.5">
            {LOI_ICH.map((d) => (
              <View key={d} className="flex-row items-start gap-2.5">
                <Ionicons name="sparkles" size={15} color={MAU.vang} style={{ marginTop: 3 }} />
                <Text
                  style={{ fontFamily: CHU.than, fontSize: 14.5, lineHeight: 22 }}
                  className="flex-1 text-chu-phu">
                  {d}
                </Text>
              </View>
            ))}
          </View>
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

          {loi ? (
            <Text
              style={{ fontFamily: CHU.than }}
              className="mt-4 text-center text-sm leading-5 text-canh">
              {loi}
            </Text>
          ) : null}

          <Text
            style={{ fontFamily: CHU.than }}
            className="mt-4 text-center text-[11px] leading-5 text-chu-mo">
            Chọn cách dùng ngay thì hồ sơ chỉ nằm trên máy này. Đổi máy hoặc gỡ app là mất, và
            không khôi phục được. Vào mục Cá nhân đăng nhập sau lúc nào cũng được, dữ liệu đang có
            vẫn giữ nguyên.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
