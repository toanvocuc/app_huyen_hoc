import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Trong, VanNgan } from '@/components/nen';
import { VongSo } from '@/components/vong-so';
import { CHU, MAU } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useSoChuDao, useSoVanMenh } from '@/lib/kho-noi-dung';
import { soChuDao, soVanMenh } from '@/lib/numerology';

type Tab = 'chu-dao' | 'van-menh';

export default function ThanSo() {
  const { hoSo } = useHoSo();
  const chuDao = useSoChuDao();
  const vanMenh = useSoVanMenh();
  const [tab, setTab] = useState<Tab>('chu-dao');

  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const soCD = ns ? soChuDao(ns.ngay, ns.thang, ns.nam) : null;
  const soVM = hoSo?.ho_ten ? soVanMenh(hoSo.ho_ten) : null;

  const noiDungCD = chuDao.dong?.find((d) => d.so === soCD);
  const noiDungVM = vanMenh.dong?.find((d) => d.so === soVM);

  const laChuDao = tab === 'chu-dao';
  const so = laChuDao ? soCD : soVM;
  const ten = laChuDao ? noiDungCD?.ten : noiDungVM?.ten;

  if (!ns) {
    return (
      <ManHinh quayLai tieuDe="Thần số học">
        <Trong loi="Chưa có ngày sinh nên chưa tính được số chủ đạo." />
      </ManHinh>
    );
  }

  return (
    <ManHinh quayLai>
      <Text
        style={{ fontFamily: CHU.hoaDam, fontSize: 40, lineHeight: 46, color: MAU.vang }}
        className="text-center">
        Thần số học
      </Text>
      <Text style={{ fontFamily: CHU.than }} className="mt-1 text-center text-sm text-chu-phu">
        {hoSo?.ho_ten}
      </Text>

      <View
        style={{ borderColor: MAU.vien }}
        className="mt-7 flex-row rounded-full border bg-nen-nhat p-1">
        {(
          [
            ['chu-dao', 'Số chủ đạo'],
            ['van-menh', 'Số vận mệnh'],
          ] as [Tab, string][]
        ).map(([ma, nhan]) => {
          const dang = tab === ma;
          return (
            <Pressable
              key={ma}
              onPress={() => setTab(ma)}
              style={{ backgroundColor: dang ? MAU.vang : 'transparent' }}
              className="min-h-[44px] flex-1 items-center justify-center rounded-full active:opacity-80">
              <Text
                style={{ fontFamily: CHU.thanDam, color: dang ? MAU.nen : MAU.chuPhu }}
                className="text-sm">
                {nhan}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-9 items-center">
        <VongSo so={so} />
        {ten ? (
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 30, lineHeight: 36 }}
            className="mt-5 text-center text-chu-chinh">
            {ten}
          </Text>
        ) : null}
        <Text
          style={{ fontFamily: CHU.thanDam, letterSpacing: 1.6 }}
          className="mt-2 text-[11px] uppercase text-vang">
          {laChuDao ? 'Tính từ ngày sinh' : 'Tính từ họ và tên'}
        </Text>
      </View>

      <VanNgan />

      <View className="gap-4">
        {chuDao.dangTai || vanMenh.dangTai ? <DangTai /> : null}

        {laChuDao && noiDungCD ? (
          <>
            <Khoi>
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
            <Khoi vien>
              <Nhan>Lời khuyên</Nhan>
              <ChuThan>{noiDungCD.loi_khuyen}</ChuThan>
            </Khoi>
          </>
        ) : null}

        {!laChuDao && noiDungVM ? (
          <>
            <Khoi>
              <ChuThan>{noiDungVM.y_nghia}</ChuThan>
            </Khoi>
            <Khoi vien>
              <Nhan>Lời khuyên</Nhan>
              <ChuThan>{noiDungVM.loi_khuyen}</ChuThan>
            </Khoi>
          </>
        ) : null}

        {!laChuDao && !hoSo?.ho_ten ? (
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
