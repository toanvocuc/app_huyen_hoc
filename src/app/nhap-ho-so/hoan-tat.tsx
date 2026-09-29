import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NenSao } from '@/components/nen-sao';
import { VongSo } from '@/components/vong-so';
import { Nut, VanNgan } from '@/components/nen';
import { CHU, MAU, NEN_CHUYEN } from '@/constants/giao-dien';
import { layBanNhap, xoaBanNhap } from '@/lib/ban-nhap';
import { luuHoSo } from '@/lib/ho-so';
import { soChuDao } from '@/lib/numerology';
import { cungTheoNgay, timCung } from '@/lib/zodiac';

export default function HoanTat() {
  const b = layBanNhap();
  const [dangLuu, setDangLuu] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  const ngay = Number(b.ngay);
  const thang = Number(b.thang);
  const nam = Number(b.nam);
  const maCung = cungTheoNgay(ngay, thang);
  const cung = maCung ? timCung(maCung) : null;
  const so = soChuDao(ngay, thang, nam);

  useEffect(() => {
    luuHoSo({
      ho_ten: b.hoTen,
      ngay_sinh: `${b.nam}-${b.thang.padStart(2, '0')}-${b.ngay.padStart(2, '0')}`,
      gio_sinh: b.gio ? `${b.gio.padStart(2, '0')}:${(b.phut || '0').padStart(2, '0')}` : null,
      noi_sinh: b.noiSinh,
      gioi_tinh: b.gioiTinh,
    })
      .then(() => xoaBanNhap())
      .catch((e) => setLoi(e instanceof Error ? e.message : 'Chưa lưu được hồ sơ'))
      .finally(() => setDangLuu(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      <NenSao cao={380} mo={0.85} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View className="flex-1 justify-center px-7">
          <View className="items-center">
            <VongSo so={so} co={150} />
          </View>

          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 36, lineHeight: 42 }}
            className="mt-7 text-center text-chu-chinh">
            Chúc mừng {b.hoTen.split(' ').pop()}
          </Text>
          <Text
            style={{ fontFamily: CHU.than, fontSize: 14.5, lineHeight: 23 }}
            className="mx-auto mt-2 max-w-[300px] text-center text-chu-phu">
            Hồ sơ của bạn đã lập xong. Từ đây mọi lời luận giải đều tính theo ngày sinh của
            chính bạn.
          </Text>

          <VanNgan />

          <View className="gap-3">
            <Dong bieu="star-outline" nhan="Cung hoàng đạo" gia={cung?.ten ?? '—'} />
            <Dong bieu="sparkles-outline" nhan="Số chủ đạo" gia={String(so)} />
            {b.noiSinh ? (
              <Dong bieu="location-outline" nhan="Nơi sinh" gia={b.noiSinh} />
            ) : null}
          </View>

          {loi ? (
            <Text style={{ fontFamily: CHU.than }} className="mt-5 text-center text-sm text-canh">
              {loi}
            </Text>
          ) : null}
        </View>

        <View className="px-7 pb-3">
          {dangLuu ? (
            <View className="h-[54px] items-center justify-center">
              <ActivityIndicator color={MAU.vang} />
            </View>
          ) : (
            <Nut nhan="Bắt đầu khám phá" onPress={() => router.replace('/(tabs)')} />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Dong({
  bieu,
  nhan,
  gia,
}: {
  bieu: keyof typeof Ionicons.glyphMap;
  nhan: string;
  gia: string;
}) {
  return (
    <View
      style={{ borderColor: MAU.vien }}
      className="flex-row items-center gap-3.5 rounded-2xl border bg-nen-nhat px-4 py-3.5">
      <Ionicons name={bieu} size={18} color={MAU.vang} />
      <Text
        style={{ fontFamily: CHU.thanDam, letterSpacing: 1.2 }}
        className="flex-1 text-[10px] uppercase text-chu-mo">
        {nhan}
      </Text>
      <Text style={{ fontFamily: CHU.thanDam }} className="text-base text-chu-chinh">
        {gia}
      </Text>
    </View>
  );
}
