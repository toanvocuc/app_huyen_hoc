import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { KhungBuoc } from '@/components/khung-buoc';
import { CHU, MAU } from '@/constants/giao-dien';
import { datBanNhap, layBanNhap } from '@/lib/ban-nhap';

export default function BuocGioSinh() {
  const b = layBanNhap();
  const [gio, setGio] = useState(b.gio);
  const [phut, setPhut] = useState(b.phut);

  return (
    <KhungBuoc
      tenMan="Giờ sinh"
      buoc={3}
      hoi="Bạn sinh vào lúc mấy giờ?"
      dan="Giờ sinh chỉ cần khi lập lá số Tử Vi. Không nhớ thì bỏ qua, các phần khác vẫn chạy đủ."
      nhanNut={gio ? 'Tiếp tục' : 'Tôi không nhớ giờ sinh'}
      onTiep={() => {
        datBanNhap({ gio, phut });
        router.push('/nhap-ho-so/noi-sinh');
      }}>
      <View className="mb-7 items-center">
        <Image
          source={require('@/assets/nen/dong-ho-cat.jpg')}
          style={{ width: 150, height: 211, borderRadius: 18 }}
          contentFit="cover"
        />
      </View>

      <View
        style={{ borderColor: MAU.vien }}
        className="flex-row items-center justify-center gap-2 rounded-2xl border bg-nen-nhat py-7">
        <TextInput
          value={gio}
          onChangeText={(v) => setGio(v.replace(/[^0-9]/g, '').slice(0, 2))}
          placeholder="00"
          placeholderTextColor={MAU.chuMo}
          keyboardType="number-pad"
          maxLength={2}
          style={{ fontFamily: CHU.hoaDam, fontSize: 46, width: 86 }}
          className="text-center text-chu-chinh"
        />
        <Text style={{ fontFamily: CHU.hoaDam, fontSize: 40 }} className="text-vang">
          :
        </Text>
        <TextInput
          value={phut}
          onChangeText={(v) => setPhut(v.replace(/[^0-9]/g, '').slice(0, 2))}
          placeholder="00"
          placeholderTextColor={MAU.chuMo}
          keyboardType="number-pad"
          maxLength={2}
          style={{ fontFamily: CHU.hoaDam, fontSize: 46, width: 86 }}
          className="text-center text-chu-chinh"
        />
      </View>

      <Text
        style={{ fontFamily: CHU.thanDam, letterSpacing: 1.3 }}
        className="mt-3 text-center text-[10px] uppercase text-chu-mo">
        Giờ  ·  Phút
      </Text>
    </KhungBuoc>
  );
}
