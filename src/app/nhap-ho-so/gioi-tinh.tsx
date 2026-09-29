import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { KhungBuoc } from '@/components/khung-buoc';
import { CHU, MAU } from '@/constants/giao-dien';
import { datBanNhap, layBanNhap } from '@/lib/ban-nhap';
import type { GioiTinh } from '@/lib/ho-so';

const CHON: { ma: GioiTinh; ten: string; mo: string; bieu: keyof typeof Ionicons.glyphMap }[] = [
  { ma: 'nam', ten: 'Nam giới', mo: 'Thuộc phần dương', bieu: 'male-outline' },
  { ma: 'nu', ten: 'Nữ giới', mo: 'Thuộc phần âm', bieu: 'female-outline' },
  { ma: 'khac', ten: 'Khác', mo: 'Không muốn nói rõ', bieu: 'ellipse-outline' },
];

export default function BuocGioiTinh() {
  const [gioiTinh, setGioiTinh] = useState<GioiTinh | null>(layBanNhap().gioiTinh);

  return (
    <KhungBuoc
      tenMan="Hồ sơ cá nhân"
      buoc={5}
      hoi="Giới tính của bạn?"
      dan="Một số cách luận giải phân theo âm dương, nên thông tin này giúp lời đọc sát hơn."
      nhanNut="Hoàn tất"
      tat={!gioiTinh}
      onTiep={() => {
        datBanNhap({ gioiTinh });
        router.replace('/nhap-ho-so/hoan-tat');
      }}
      duoi={
        <Text
          style={{ fontFamily: CHU.than, fontStyle: 'italic' }}
          className="mt-7 text-center text-xs leading-5 text-chu-mo">
          Âm dương hoà hợp là cội nguồn của sự cân bằng
        </Text>
      }>
      <View className="gap-3">
        {CHON.map((c) => {
          const dang = gioiTinh === c.ma;
          return (
            <Pressable
              key={c.ma}
              onPress={() => setGioiTinh(c.ma)}
              style={{ borderColor: dang ? MAU.vang : MAU.vien, borderWidth: dang ? 1.5 : 1 }}
              className="flex-row items-center gap-4 rounded-2xl bg-nen-nhat px-4 py-4 active:opacity-80">
              <View
                style={{ borderColor: dang ? MAU.vang : MAU.vien }}
                className="h-11 w-11 items-center justify-center rounded-xl border">
                <Ionicons name={c.bieu} size={20} color={dang ? MAU.vang : MAU.chuPhu} />
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: CHU.thanDam, letterSpacing: 0.6 }}
                  className={dang ? 'text-base uppercase text-vang' : 'text-base uppercase text-chu-chinh'}>
                  {c.ten}
                </Text>
                <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-sm text-chu-phu">
                  {c.mo}
                </Text>
              </View>
              <View
                style={{
                  borderColor: dang ? MAU.vang : MAU.vien,
                  backgroundColor: dang ? MAU.vang : 'transparent',
                }}
                className="h-6 w-6 items-center justify-center rounded-full border">
                {dang ? <Ionicons name="checkmark" size={14} color={MAU.nen} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </KhungBuoc>
  );
}
