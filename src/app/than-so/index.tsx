import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Trong } from '@/components/nen';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useSoChuDao, useSoVanMenh } from '@/lib/kho-noi-dung';
import { soChuDao, soVanMenh } from '@/lib/numerology';

export default function ThanSo() {
  const { hoSo } = useHoSo();
  const chuDao = useSoChuDao();
  const vanMenh = useSoVanMenh();
  const [tab, setTab] = useState<'chu-dao' | 'van-menh'>('chu-dao');

  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const soCD = ns ? soChuDao(ns.ngay, ns.thang, ns.nam) : null;
  const soVM = hoSo?.ho_ten ? soVanMenh(hoSo.ho_ten) : null;

  const noiDungCD = chuDao.dong?.find((d) => d.so === soCD);
  const noiDungVM = vanMenh.dong?.find((d) => d.so === soVM);
  const so = tab === 'chu-dao' ? soCD : soVM;

  if (!ns) {
    return (
      <ManHinh quayLai tieuDe="Thần số học">
        <Trong loi="Chưa có ngày sinh nên chưa tính được số chủ đạo." />
      </ManHinh>
    );
  }

  return (
    <ManHinh quayLai tieuDe="Thần số học" phu={hoSo?.ho_ten ?? undefined}>
      <View className="flex-row rounded-xl bg-nen-nhat p-1">
        {([
          ['chu-dao', 'Số chủ đạo'],
          ['van-menh', 'Số vận mệnh'],
        ] as ['chu-dao' | 'van-menh', string][]).map(([ma, ten]) => (
          <Pressable
            key={ma}
            onPress={() => setTab(ma)}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-lg ${
              tab === ma ? 'bg-vang' : ''
            }`}>
            <Text className={`text-sm font-semibold ${tab === ma ? 'text-nen' : 'text-chu-phu'}`}>
              {ten}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-7 items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-vang">
          <Text className="text-4xl font-bold text-vang">{so ?? '—'}</Text>
        </View>
        <Text className="mt-3 text-xs text-chu-mo">
          {tab === 'chu-dao' ? 'Tính từ ngày sinh' : 'Tính từ họ và tên'}
        </Text>
      </View>

      <View className="mt-7 gap-4">
        {chuDao.dangTai || vanMenh.dangTai ? <DangTai /> : null}

        {tab === 'chu-dao' && noiDungCD ? (
          <>
            <Khoi>
              <Nhan>{noiDungCD.ten}</Nhan>
              <ChuThan>{noiDungCD.tinh_cach}</ChuThan>
            </Khoi>
            <Khoi>
              <Nhan>Điểm mạnh</Nhan>
              <ChuThan>{noiDungCD.diem_manh}</ChuThan>
            </Khoi>
            <Khoi>
              <Nhan>Điểm yếu</Nhan>
              <ChuThan>{noiDungCD.diem_yeu}</ChuThan>
            </Khoi>
            <Khoi>
              <Nhan>Lời khuyên</Nhan>
              <ChuThan>{noiDungCD.loi_khuyen}</ChuThan>
            </Khoi>
          </>
        ) : null}

        {tab === 'van-menh' && noiDungVM ? (
          <>
            <Khoi>
              <Nhan>{noiDungVM.ten}</Nhan>
              <ChuThan>{noiDungVM.y_nghia}</ChuThan>
            </Khoi>
            <Khoi>
              <Nhan>Lời khuyên</Nhan>
              <ChuThan>{noiDungVM.loi_khuyen}</ChuThan>
            </Khoi>
          </>
        ) : null}

        {tab === 'van-menh' && !hoSo?.ho_ten ? (
          <Trong loi="Chưa có họ tên nên chưa tính được số vận mệnh." />
        ) : null}
      </View>

      <HoiChuyenGia
        manHinh="than-so-hoc"
        loiMoi={`Số ${so ?? ''} nói gì về năm nay của bạn? Nhắn cho chuyên gia để hỏi kỹ hơn.`}
      />
    </ManHinh>
  );
}
