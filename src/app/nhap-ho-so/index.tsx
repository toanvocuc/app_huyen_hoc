import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Nut } from '@/components/nen';

export default function ChaoMung() {
  return (
    <SafeAreaView className="flex-1 bg-nen">
      <View className="flex-1 justify-center px-7">
        <View className="mb-10 h-20 w-20 items-center justify-center self-center rounded-2xl border border-vang/40">
          <View className="h-9 w-9 rotate-45 rounded-sm border border-vang" />
        </View>

        <Text className="text-center text-3xl font-bold leading-10 text-chu-chinh">
          Mỗi ngày một lá bài
        </Text>
        <Text className="mt-3 text-center text-base leading-6 text-chu-phu">
          Rút bài Tarot, xem cung hoàng đạo và thần số học. Không cần đăng ký, mở lên là dùng
          được ngay.
        </Text>
      </View>

      <View className="px-7 pb-8">
        <Text className="mb-5 text-center text-xs leading-5 text-chu-mo">
          Nội dung trong app chỉ mang tính giải trí và tham khảo, không thay thế cho lời khuyên
          về y tế, tài chính hay pháp lý.
        </Text>
        <Nut nhan="Bắt đầu" onPress={() => router.push('/nhap-ho-so/dieu-khoan')} />
      </View>
    </SafeAreaView>
  );
}
