import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { KhungBuoc } from '@/components/khung-buoc';
import { Image } from 'expo-image';
import { CHU, MAU } from '@/constants/giao-dien';
import { datBanNhap, layBanNhap } from '@/lib/ban-nhap';
import { kiemNgaySinh } from '@/lib/ho-so';

export default function BuocNgaySinh() {
  const b = layBanNhap();
  const [ngay, setNgay] = useState(b.ngay);
  const [thang, setThang] = useState(b.thang);
  const [nam, setNam] = useState(b.nam);
  const [loi, setLoi] = useState<string | null>(null);

  const du = ngay.length > 0 && thang.length > 0 && nam.length === 4;

  return (
    <KhungBuoc
      tenMan="Ngày sinh của bạn"
      buoc={2}
      hoi="Bạn sinh ngày nào?"
      dan="Ngày sinh là chìa khoá để xác định cung hoàng đạo và số chủ đạo của bạn."
      tat={!du}
      onTiep={() => {
        const bao = kiemNgaySinh(Number(ngay), Number(thang), Number(nam));
        if (bao) {
          setLoi(bao);
          return;
        }
        datBanNhap({ ngay, thang, nam });
        router.push('/nhap-ho-so/gio-sinh');
      }}>
      <View className="mb-8 items-center">
        <Image
          source={require('@/assets/nen/vong-hoang-dao.jpg')}
          style={{ width: 210, height: 210, borderRadius: 105 }}
          contentFit="cover"
        />
      </View>

      <View className="flex-row items-start gap-3">
        <O gia={ngay} dat={setNgay} nhan="Ngày" dai={2} />
        <O gia={thang} dat={setThang} nhan="Tháng" dai={2} />
        <O gia={nam} dat={setNam} nhan="Năm" dai={4} rong />
      </View>

      {loi ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-4 text-center text-sm text-canh">
          {loi}
        </Text>
      ) : null}
    </KhungBuoc>
  );
}

function O({
  gia,
  dat,
  nhan,
  dai,
  rong,
}: {
  gia: string;
  dat: (v: string) => void;
  nhan: string;
  dai: number;
  rong?: boolean;
}) {
  return (
    <View style={{ flex: rong ? 1.4 : 1, minWidth: 0 }}>
      <Text
        style={{ fontFamily: CHU.thanDam, letterSpacing: 1.3 }}
        className="mb-2 text-center text-[10px] uppercase text-chu-mo">
        {nhan}
      </Text>
      <TextInput
        value={gia}
        onChangeText={(v) => dat(v.replace(/[^0-9]/g, '').slice(0, dai))}
        placeholder={'—'.repeat(dai > 2 ? 4 : 2)}
        placeholderTextColor={MAU.chuMo}
        keyboardType="number-pad"
        maxLength={dai}
        style={{ fontFamily: CHU.than, height: 60, borderColor: MAU.vien }}
        className="rounded-2xl border bg-nen-nhat px-2 text-center text-xl text-chu-chinh"
      />
    </View>
  );
}
