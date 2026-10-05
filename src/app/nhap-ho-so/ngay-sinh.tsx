import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { BanhXeNgaySinh } from '@/components/banh-xe';
import { KhungBuoc } from '@/components/khung-buoc';
import { CHU } from '@/constants/giao-dien';
import { datBanNhap, layBanNhap } from '@/lib/ban-nhap';
import { kiemNgaySinh } from '@/lib/ho-so';
import { NAM_MAC_DINH } from '@/lib/ngay-thang';

export default function BuocNgaySinh() {
  const b = layBanNhap();
  const [ngay, setNgay] = useState(Number(b.ngay) || 1);
  const [thang, setThang] = useState(Number(b.thang) || 1);
  const [nam, setNam] = useState(Number(b.nam) || NAM_MAC_DINH);
  const [loi, setLoi] = useState<string | null>(null);

  // Bọc trong useCallback vì bên trong bánh xe có một useEffect phụ thuộc vào
  // hàm này. Trả về hàm mới mỗi lần vẽ lại thì effect đó chạy không ngừng.
  const dat = useCallback((phan: { ngay?: number; thang?: number; nam?: number }) => {
    if (phan.ngay !== undefined) setNgay(phan.ngay);
    if (phan.thang !== undefined) setThang(phan.thang);
    if (phan.nam !== undefined) setNam(phan.nam);
    setLoi(null);
  }, []);

  return (
    <KhungBuoc
      tenMan="Ngày sinh của bạn"
      buoc={2}
      hoi="Bạn sinh ngày nào?"
      dan="Ngày sinh là chìa khoá để xác định cung hoàng đạo và số chủ đạo của bạn."
      cuon={false}
      onTiep={() => {
        const bao = kiemNgaySinh(ngay, thang, nam);
        if (bao) {
          setLoi(bao);
          return;
        }
        datBanNhap({ ngay: String(ngay), thang: String(thang), nam: String(nam) });
        router.push('/nhap-ho-so/gio-sinh');
      }}>
      {/*
        Màn này không cuộn được, nên ảnh phải tự co theo chỗ còn lại: nhiều chỗ
        thì nở tới 150, chật thì teo dần rồi mất hẳn. Bánh xe đặt flexShrink 0
        để không bao giờ bị bóp, vì bóp là mất dòng.
      */}
      <View className="mb-7 items-center justify-center" style={{ flex: 1, maxHeight: 150 }}>
        <Image
          source={require('@/assets/nen/vong-hoang-dao.jpg')}
          style={{ flex: 1, aspectRatio: 1, borderRadius: 999 }}
          contentFit="cover"
        />
      </View>

      <View style={{ flexShrink: 0 }}>
        <BanhXeNgaySinh ngay={ngay} thang={thang} nam={nam} dat={dat} />
      </View>

      {loi ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-4 text-center text-sm text-canh">
          {loi}
        </Text>
      ) : null}
    </KhungBuoc>
  );
}
