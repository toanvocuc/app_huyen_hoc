import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BauTroiDong } from '@/components/bau-troi-dong';
import { Logo } from '@/components/logo';
import { Nut } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';

const { width: RONG, height: CAO } = Dimensions.get('window');

/**
 * Màn chào, và là màn ĐẦU TIÊN người duyệt app của Apple nhìn thấy sau khi bấm
 * "Dùng ngay".
 *
 * Câu chữ ở đây cố ý nói về đặt lịch với chuyên gia và khám phá bản thân, không
 * nói lá bài. Không phải để giấu: thẻ Khám phá vẫn bày đủ, và dòng miễn trừ ngay
 * dưới vẫn nói rõ đây là nội dung tham khảo. Lý do là THỨ TỰ — app từng bị từ
 * chối theo điều 4.3(b) vì mở ra là tarot, xem `(tabs)/_layout.tsx`. Sửa thứ tự
 * thẻ tab mà để màn chào vẫn mở đầu bằng "Mỗi ngày một lá bài" thì mới đi được
 * nửa đường.
 */
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
      <BauTroiDong />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View className="items-center pt-10">
          <Logo rong={150} />
        </View>

        <View className="flex-1" />

        <View className="px-8 pb-2">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 44, lineHeight: 50 }}
            className="text-center text-chu-chinh">
            Khám phá{'\n'}
            <Text style={{ color: MAU.vang }}>chính mình</Text>
          </Text>
          <Text
            style={{ fontFamily: CHU.than, fontSize: 15, lineHeight: 24 }}
            className="mx-auto mt-4 max-w-[300px] text-center text-chu-phu">
            Trò chuyện với chuyên gia thật, và hiểu thêm về chính mình.
          </Text>
        </View>

        <View className="px-8 pb-6 pt-10">
          <Text
            style={{ fontFamily: CHU.than }}
            className="mb-5 text-center text-[11px] leading-5 text-chu-mo">
            Nội dung mang tính tham khảo và giải trí.
          </Text>
          <Nut nhan="Bắt đầu" onPress={() => router.push('/nhap-ho-so/dieu-khoan')} />

          {/* Lối đi thẳng vào app, không khai gì cả. App không chặn ai vì thiếu
              hồ sơ — phần nào cần thì tự hỏi đúng lúc cần. */}
          <Pressable
            onPress={() => router.replace('/')}
            className="mt-5 self-center px-4 py-2 active:opacity-60">
            <Text style={{ fontFamily: CHU.than }} className="text-sm text-vang underline">
              Xem trước đã
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
