import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Trong } from '@/components/nen';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useCung } from '@/lib/kho-noi-dung';
import { cungTheoNgay, timCung } from '@/lib/zodiac';

type Tab = 'hom-nay' | 'tuan-nay' | 'tinh-cach';

export default function TrangCung() {
  const { hoSo } = useHoSo();
  const { dong, dangTai } = useCung();
  const [tab, setTab] = useState<Tab>('hom-nay');

  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const ma = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cung = ma ? timCung(ma) : null;
  const noiDung = dong?.find((c) => c.ma === ma);

  if (!cung) {
    return (
      <ManHinh quayLai tieuDe="Cung hoàng đạo">
        <Trong loi="Chưa có ngày sinh nên chưa xác định được cung." />
      </ManHinh>
    );
  }

  return (
    <ManHinh
      quayLai
      tieuDe={cung.ten}
      phu={`${cung.nguyenTo} · ${noiDung?.tu_ngay ?? ''} đến ${noiDung?.den_ngay ?? ''}`}>
      <View className="flex-row rounded-xl bg-nen-nhat p-1">
        {([
          ['hom-nay', 'Hôm nay'],
          ['tuan-nay', 'Tuần này'],
          ['tinh-cach', 'Tính cách'],
        ] as [Tab, string][]).map(([ma2, ten]) => (
          <Pressable
            key={ma2}
            onPress={() => setTab(ma2)}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-lg ${
              tab === ma2 ? 'bg-vang' : ''
            }`}>
            <Text className={`text-sm font-semibold ${tab === ma2 ? 'text-nen' : 'text-chu-phu'}`}>
              {ten}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-6">
        {dangTai ? <DangTai /> : null}

        {tab === 'tinh-cach' && noiDung ? (
          <View className="gap-4">
            <Khoi>
              <Nhan>Tính cách</Nhan>
              <ChuThan>{noiDung.tinh_cach}</ChuThan>
            </Khoi>
            <Khoi>
              <Nhan>Điểm mạnh</Nhan>
              <ChuThan>{noiDung.diem_manh}</ChuThan>
            </Khoi>
            <Khoi>
              <Nhan>Điểm yếu</Nhan>
              <ChuThan>{noiDung.diem_yeu}</ChuThan>
            </Khoi>
          </View>
        ) : null}

        {tab !== 'tinh-cach' ? (
          <Trong
            loi={
              'Nội dung tử vi sinh sẵn theo lô ở máy chủ, chưa có bản cho ngày này. ' +
              'Phần sinh nội dung nằm ở mục E02 và E03 của kế hoạch.'
            }
          />
        ) : null}
      </View>

      <HoiChuyenGia
        manHinh="cung-hoang-dao"
        loiMoi={`Là ${cung.ten} thì điều gì đang chờ bạn tháng này? Nhắn cho chuyên gia để hỏi cho rõ.`}
      />
    </ManHinh>
  );
}
