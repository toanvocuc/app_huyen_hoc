import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Platform, Text, View } from 'react-native';
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

/**
 * Ba điều đăng nhập đổi được cho khách.
 *
 * Chỉ hứa đúng thứ app làm được thật. Cả ba đều đúng vì hồ sơ và lịch sử rút
 * bài nằm trên máy chủ, khoá theo tài khoản: đăng nhập lại ở máy nào cũng đọc
 * đúng dữ liệu đó. Đừng thêm dòng nào về sao lưu hay mua bán khi chưa có.
 */
const LOI_ICH = [
  'Đổi máy vẫn giữ nguyên hồ sơ',
  'Xem lại mọi lần rút bài cũ',
  'Một hồ sơ, dùng trên nhiều máy',
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

          {/* Trước đây mỗi dòng có một biểu tượng sao ở lề trái. Ba ngôi xếp
              dọc trông vụn, và dòng nào dài quá thì xuống hàng làm lệch nhịp
              cả cột. Giờ căn giữa, một dấu sao duy nhất làm mốc cho cả khối. */}
          <View className="mt-5 items-center">
            <Ionicons name="sparkles" size={14} color={MAU.vang} />
            <View className="mt-3 gap-1.5">
              {LOI_ICH.map((d) => (
                <Text
                  key={d}
                  // KHÔNG khoá một dòng. Đo ra: máy nhỏ 320dp để cỡ chữ lớn thì
                  // hai dòng tràn khung, mà khoá lại là cắt cụt chữ. Căn giữa
                  // nên xuống hàng vẫn cân, cắt cụt thì không chữa được.
                  style={{ fontFamily: CHU.than, fontSize: 14.5, lineHeight: 24 }}
                  className="text-center text-chu-phu">
                  {d}
                </Text>
              ))}
            </View>
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
            Dùng ngay thì hồ sơ chỉ nằm trên máy này. Đăng nhập sau trong mục Cá nhân cũng
            được, dữ liệu vẫn giữ nguyên.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
