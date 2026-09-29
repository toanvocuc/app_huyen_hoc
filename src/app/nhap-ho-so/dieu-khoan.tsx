import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Khoi, ManHinh, Nut } from '@/components/nen';

export default function DieuKhoan() {
  const [dongY, setDongY] = useState(false);

  return (
    <ManHinh
      quayLai
      tieuDe="Điều khoản và quyền riêng tư"
      phu="Đọc qua một lượt trước khi bắt đầu.">
      <Khoi>
        <Text className="text-base leading-6 text-chu-chinh">App lưu những gì</Text>
        <Text className="mt-2 text-sm leading-6 text-chu-phu">
          Họ tên, ngày sinh, giờ sinh và nơi sinh bạn tự nhập. Những thứ này dùng để tính cung
          hoàng đạo, số chủ đạo và chọn lá bài của ngày.
        </Text>
        <Text className="mt-4 text-base leading-6 text-chu-chinh">App không lưu những gì</Text>
        <Text className="mt-2 text-sm leading-6 text-chu-phu">
          Không đọc danh bạ, không đọc ảnh, không lấy vị trí. Không có quảng cáo và không bán
          dữ liệu cho bên thứ ba.
        </Text>
        <Text className="mt-4 text-base leading-6 text-chu-chinh">Xoá lúc nào cũng được</Text>
        <Text className="mt-2 text-sm leading-6 text-chu-phu">
          Vào mục Cá nhân, chọn xoá dữ liệu. Mọi thứ biến mất khỏi máy chủ ngay, không giữ lại
          bản sao.
        </Text>
      </Khoi>

      <Pressable
        onPress={() => setDongY((v) => !v)}
        className="mt-6 flex-row items-start gap-3 py-2 active:opacity-70">
        <View
          className={`mt-0.5 h-6 w-6 items-center justify-center rounded-md border ${
            dongY ? 'border-vang bg-vang' : 'border-chu-mo'
          }`}>
          {dongY ? <Text className="text-sm font-bold text-nen">✓</Text> : null}
        </View>
        <Text className="flex-1 text-sm leading-6 text-chu-phu">
          Tôi đã đọc và đồng ý với điều khoản sử dụng và chính sách quyền riêng tư
        </Text>
      </Pressable>

      <View className="mt-6">
        <Nut nhan="Tiếp tục" tat={!dongY} onPress={() => router.push('/nhap-ho-so/ten')} />
      </View>
    </ManHinh>
  );
}
