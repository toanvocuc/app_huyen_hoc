import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { KhungBuoc } from '@/components/khung-buoc';
import { CHU, MAU } from '@/constants/giao-dien';
import { TINH_THANH } from '@/data/tinh-thanh';
import { datBanNhap, layBanNhap } from '@/lib/ban-nhap';
import { boDau } from '@/lib/numerology';

export default function BuocNoiSinh() {
  const [tim, setTim] = useState('');
  const [chon, setChon] = useState<string | null>(layBanNhap().noiSinh);

  // Gõ không dấu vẫn tìm ra, vì phần lớn người dùng gõ nhanh không bỏ dấu.
  const danhSach = useMemo(() => {
    const k = boDau(tim).trim();
    return k ? TINH_THANH.filter((t) => boDau(t).includes(k)) : TINH_THANH;
  }, [tim]);

  return (
    <KhungBuoc
      tenMan="Nơi sinh"
      buoc={4}
      hoi="Bạn sinh ra ở đâu?"
      dan="Vị trí địa lý giúp xác định kinh độ và vĩ độ, dùng khi lập lá số. Chưa cần thì bỏ qua."
      nhanNut={chon ? 'Tiếp tục' : 'Bỏ qua bước này'}
      onTiep={() => {
        datBanNhap({ noiSinh: chon });
        router.push('/nhap-ho-so/gioi-tinh');
      }}>
      <View
        style={{ borderColor: MAU.vien }}
        className="mb-4 flex-row items-center gap-3 rounded-2xl border bg-nen-nhat px-4">
        <Ionicons name="search-outline" size={18} color={MAU.chuMo} />
        <TextInput
          value={tim}
          onChangeText={setTim}
          placeholder="Tìm tỉnh, thành phố"
          placeholderTextColor={MAU.chuMo}
          style={{ fontFamily: CHU.than, height: 54, flex: 1 }}
          className="text-base text-chu-chinh"
        />
      </View>

      <View className="gap-2.5">
        {danhSach.length === 0 ? (
          <Text style={{ fontFamily: CHU.than }} className="py-5 text-center text-sm text-chu-phu">
            Không tìm thấy tỉnh thành nào
          </Text>
        ) : (
          danhSach.map((t) => {
            const dang = chon === t;
            return (
              <Pressable
                key={t}
                onPress={() => setChon(dang ? null : t)}
                style={{ borderColor: dang ? MAU.vang : MAU.vien }}
                className="flex-row items-center gap-3 rounded-2xl border bg-nen-nhat px-4 py-3.5 active:opacity-70">
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={dang ? MAU.vang : MAU.chuMo}
                />
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: CHU.thanVua }}
                    className={dang ? 'text-base text-vang' : 'text-base text-chu-chinh'}>
                    {t}
                  </Text>
                  <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-mo">
                    Việt Nam
                  </Text>
                </View>
                {dang ? <Ionicons name="checkmark" size={17} color={MAU.vang} /> : null}
              </Pressable>
            );
          })
        )}
      </View>
    </KhungBuoc>
  );
}
