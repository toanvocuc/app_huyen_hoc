import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { DangTai, DongDanh, ManHinh, Nhan } from '@/components/nen';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { cungTheoNgay, timCung } from '@/lib/zodiac';

export default function CaNhan() {
  const { hoSo, dangTai } = useHoSo();
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const ma = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;

  if (dangTai) {
    return (
      <ManHinh tieuDe="Cá nhân">
        <DangTai />
      </ManHinh>
    );
  }

  const chuDau = (hoSo?.ho_ten ?? '').trim().split(' ').pop()?.charAt(0).toUpperCase() ?? '?';

  return (
    <ManHinh tieuDe="Cá nhân">
      <View className="items-center">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-nen-nhat">
          <Text className="text-2xl font-bold text-vang">{chuDau}</Text>
        </View>
        <Text className="mt-3 text-xl font-bold text-chu-chinh">
          {hoSo?.ho_ten ?? 'Chưa đặt tên'}
        </Text>
        {ma ? <Text className="mt-0.5 text-sm text-chu-phu">{timCung(ma).ten}</Text> : null}
      </View>

      <View className="mt-8">
        <Nhan>Hồ sơ</Nhan>
        <DongDanh
          nhan="Ngày sinh"
          gia={ns ? `${ns.ngay}/${ns.thang}/${ns.nam}` : 'Chưa có'}
          onPress={() => router.push('/nhap-ho-so/thong-tin')}
        />
        <DongDanh nhan="Giờ sinh" gia={hoSo?.gio_sinh ?? 'Chưa có'} />
        <DongDanh
          nhan="Nơi sinh"
          gia={hoSo?.noi_sinh ?? 'Chưa có'}
          onPress={() => router.push('/nhap-ho-so/noi-sinh')}
        />
      </View>

      <View className="mt-8">
        <Nhan>Cài đặt</Nhan>
        <DongDanh nhan="Thông báo" onPress={() => router.push('/cai-dat/thong-bao')} />
        <DongDanh
          nhan="Điều khoản và quyền riêng tư"
          onPress={() => router.push('/nhap-ho-so/dieu-khoan')}
        />
        <DongDanh nhan="Xoá toàn bộ dữ liệu" onPress={() => router.push('/cai-dat/xoa-du-lieu')} />
      </View>

      <Text className="mt-10 text-center text-xs leading-5 text-chu-mo">
        Nội dung trong app chỉ mang tính giải trí và tham khảo.
      </Text>
    </ManHinh>
  );
}
