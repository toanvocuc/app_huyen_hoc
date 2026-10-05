import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ManHinh, Nhan, Trong } from '@/components/nen';
import { CHU } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { soChuDao } from '@/lib/numerology';
import { cungTheoNgay, timCung } from '@/lib/zodiac';

export default function KhamPha() {
  const { hoSo } = useHoSo();
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const ma = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cung = ma ? timCung(ma) : null;
  const so = ns ? soChuDao(ns.ngay, ns.thang, ns.nam) : null;

  return (
    <ManHinh tieuDe="Khám phá" phu="Chiêm tinh phương Tây và thần số học.">
      {!ns ? (
        <Trong loi="Chưa có ngày sinh. Vào mục Cá nhân điền ngày sinh rồi quay lại." />
      ) : (
        <View>
          <View className="mb-7 items-center">
            <Image
              source={require('@/assets/nen/vong-hoang-dao.jpg')}
              style={{ width: 190, height: 190, borderRadius: 95 }}
              contentFit="cover"
            />
          </View>

          <View className="gap-4">
          <The
            nhan="Cung hoàng đạo"
            ten={cung?.ten ?? ''}
            mo="Tử vi hôm nay, tuần này và tính cách của cung"
            onPress={() => router.push('/cung')}
          />
          <The
            nhan="Độ hợp"
            ten="Bạn và người ấy"
            mo="So hai cung hoàng đạo với nhau"
            onPress={() => router.push('/cung/do-hop')}
          />
          <The
            nhan="Thần số học"
            ten={so ? `Số chủ đạo ${so}` : ''}
            mo="Số chủ đạo từ ngày sinh và số vận mệnh từ họ tên"
            onPress={() => router.push('/than-so')}
          />
          </View>
        </View>
      )}
    </ManHinh>
  );
}

function The({ nhan, ten, mo, onPress }: { nhan: string; ten: string; mo: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl bg-nen-nhat p-5 active:opacity-70">
      <View className="flex-1 pr-3">
        <Nhan>{nhan}</Nhan>
        {ten ? <Text style={{ fontFamily: CHU.thanDam }} className="text-lg text-chu-chinh">{ten}</Text> : null}
        <Text style={{ fontFamily: CHU.than }} className="mt-1 text-sm leading-5 text-chu-phu">{mo}</Text>
      </View>
      <Text style={{ fontFamily: CHU.than }} className="text-lg text-vang">›</Text>
    </Pressable>
  );
}
