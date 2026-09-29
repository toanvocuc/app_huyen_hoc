import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Nut } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';

const { width: RONG, height: CAO } = Dimensions.get('window');

export default function ChaoMung() {
  return (
    <View className="flex-1 bg-nen">
      {/* Dải ngân hà phủ hai phần ba trên, phần dưới tan vào nền để chữ đọc được. */}
      <Image
        source={require('@/assets/nen/ngan-ha.jpg')}
        style={{ position: 'absolute', top: 0, width: RONG, height: CAO * 0.72 }}
        contentFit="cover"
        contentPosition="top"
      />
      <LinearGradient
        colors={['transparent', 'rgba(11,18,32,0.55)', MAU.nen]}
        locations={[0, 0.5, 0.88]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: CAO * 0.72 }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View className="items-center pt-12">
          <View
            style={{ borderColor: MAU.vangMo }}
            className="h-16 w-16 items-center justify-center rounded-full border">
            <View style={{ borderColor: MAU.vang }} className="h-6 w-6 rotate-45 border" />
          </View>
          <Text
            style={{ fontFamily: CHU.thanDam, letterSpacing: 3 }}
            className="mt-4 text-[10px] uppercase text-vang">
            Huyền Học
          </Text>
        </View>

        <View className="flex-1" />

        <View className="px-8 pb-2">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 44, lineHeight: 50 }}
            className="text-center text-chu-chinh">
            Mỗi ngày{'\n'}
            <Text style={{ color: MAU.vang }}>một lá bài</Text>
          </Text>
          <Text
            style={{ fontFamily: CHU.than, fontSize: 15, lineHeight: 24 }}
            className="mx-auto mt-4 max-w-[300px] text-center text-chu-phu">
            Rút bài Tarot, xem cung hoàng đạo và thần số học. Không cần đăng ký, mở lên là dùng
            được ngay.
          </Text>
        </View>

        <View className="px-8 pb-6 pt-10">
          <Text
            style={{ fontFamily: CHU.than }}
            className="mb-5 text-center text-[11px] leading-5 text-chu-mo">
            Nội dung trong app chỉ mang tính giải trí và tham khảo, không thay thế cho lời khuyên
            về y tế, tài chính hay pháp lý.
          </Text>
          <Nut nhan="Bắt đầu" onPress={() => router.push('/nhap-ho-so/dieu-khoan')} />
        </View>
      </SafeAreaView>
    </View>
  );
}
