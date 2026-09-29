import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { KhungBuoc } from '@/components/khung-buoc';
import { Nhan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { datBanNhap, layBanNhap } from '@/lib/ban-nhap';

export default function BuocTen() {
  const [hoTen, setHoTen] = useState(layBanNhap().hoTen);

  return (
    <KhungBuoc
      tenMan="Thiết lập hồ sơ"
      buoc={1}
      hoi="Bạn tên là gì?"
      dan="Để cá nhân hoá lời luận giải, hãy cho chúng tôi biết tên thường gọi của bạn."
      tat={hoTen.trim().length === 0}
      onTiep={() => {
        datBanNhap({ hoTen: hoTen.trim() });
        router.push('/nhap-ho-so/ngay-sinh');
      }}
      duoi={
        <Text
          style={{ fontFamily: CHU.than }}
          className="mt-5 text-center text-xs leading-5 text-chu-mo">
          Tên này chỉ hiện trong app của bạn, không gửi đi đâu khác
        </Text>
      }>
      <Nhan>Họ và tên của bạn</Nhan>
      <View
        style={{ borderColor: MAU.vien }}
        className="flex-row items-center gap-3 rounded-2xl border bg-nen-nhat px-4">
        <Ionicons name="person-outline" size={18} color={MAU.chuMo} />
        <TextInput
          value={hoTen}
          onChangeText={setHoTen}
          placeholder="Nhập tên của bạn"
          placeholderTextColor={MAU.chuMo}
          style={{ fontFamily: CHU.than, height: 56, flex: 1 }}
          className="text-base text-chu-chinh"
        />
      </View>
    </KhungBuoc>
  );
}
