import { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { Khoi, ManHinh, Nhan } from '@/components/nen';
import { MAU } from '@/constants/giao-dien';
import { luuHoSo, useHoSo } from '@/lib/ho-so';

const GIO = ['06:00', '07:00', '08:00', '20:00', '21:00'];

export default function CaiDatThongBao() {
  const { hoSo, setHoSo } = useHoSo();
  const [laHomNay, setLaHomNay] = useState(true);
  const [tinTuc, setTinTuc] = useState(false);

  async function doiGio(g: string) {
    setHoSo((h) => (h ? { ...h, gio_nhac: g } : h));
    try {
      await luuHoSo({ gio_nhac: g });
    } catch (e) {
      console.warn('[gio-nhac]', e);
    }
  }

  const dangChon = (hoSo?.gio_nhac ?? '07:00').slice(0, 5);

  return (
    <ManHinh quayLai tieuDe="Thông báo">
      <Khoi>
        <Dong nhan="Lá bài hôm nay" mo="Mỗi sáng một lá" gia={laHomNay} dat={setLaHomNay} />
        <View className="h-px bg-vien" />
        <Dong nhan="Tin từ ứng dụng" mo="Thỉnh thoảng, không nhiều" gia={tinTuc} dat={setTinTuc} />
      </Khoi>

      <View className="mt-7">
        <Nhan>Giờ nhận lá bài</Nhan>
        <View className="flex-row flex-wrap gap-2">
          {GIO.map((g) => {
            const chon = dangChon === g;
            return (
              <Pressable
                key={g}
                onPress={() => doiGio(g)}
                className={`min-h-[44px] justify-center rounded-xl border px-5 active:opacity-70 ${
                  chon ? 'border-vang bg-vang/15' : 'border-vien bg-nen-nhat'
                }`}>
                <Text className={`text-base ${chon ? 'font-semibold text-vang' : 'text-chu-phu'}`}>
                  {g}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text className="mt-7 text-xs leading-5 text-chu-mo">
        Tắt hết thông báo ở đây vẫn không gỡ được quyền đã cấp cho app. Muốn gỡ hẳn thì vào phần
        cài đặt của máy.
      </Text>
    </ManHinh>
  );
}

function Dong({
  nhan,
  mo,
  gia,
  dat,
}: {
  nhan: string;
  mo: string;
  gia: boolean;
  dat: (v: boolean) => void;
}) {
  return (
    <View className="min-h-[56px] flex-row items-center justify-between py-2">
      <View className="flex-1 pr-4">
        <Text className="text-base text-chu-chinh">{nhan}</Text>
        <Text className="mt-0.5 text-sm text-chu-phu">{mo}</Text>
      </View>
      <Switch
        value={gia}
        onValueChange={dat}
        trackColor={{ false: MAU.vien, true: MAU.vang }}
        thumbColor={MAU.chuChinh}
      />
    </View>
  );
}
