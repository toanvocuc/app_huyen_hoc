/** Lưới 12 cung hoàng đạo. Cung của người dùng được đánh dấu riêng. */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { ThanhTieuDe } from '@/components/thanh-tieu-de';
import { CHU, MAU, NEN_CHUYEN } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useCung } from '@/lib/kho-noi-dung';
import { CUNG, cungTheoNgay } from '@/lib/zodiac';

export default function LuoiCung() {
  const { hoSo } = useHoSo();
  const { dong } = useCung();
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const cuaToi = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;

  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThanhTieuDe ten="12 cung hoàng đạo" />

        <ScrollView contentContainerClassName="px-5 pb-14 pt-6">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 30, lineHeight: 36 }}
            className="text-chu-chinh">
            Khám phá bản thân
          </Text>
          <Text
            style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 22 }}
            className="mt-1.5 text-chu-phu">
            Chọn cung của bạn hoặc của người thân để xem tính cách và độ hợp.
          </Text>

          <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
            {CUNG.map((c) => {
              const nd = dong?.find((x) => x.ma === c.ma);
              const cuaMinh = cuaToi === c.ma;
              return (
                <Pressable
                  key={c.ma}
                  onPress={() => router.push({ pathname: '/cung/chi-tiet', params: { ma: c.ma } })}
                  style={{
                    width: '48.5%',
                    borderColor: cuaMinh ? MAU.vang : MAU.vien,
                    borderWidth: cuaMinh ? 1.5 : 1,
                  }}
                  className="items-center rounded-2xl bg-nen-nhat px-3 py-5 active:opacity-75">
                  {cuaMinh ? (
                    <Text
                      style={{ fontFamily: CHU.thanDam, letterSpacing: 1.2 }}
                      className="absolute right-3 top-2.5 text-[9px] uppercase text-vang">
                      Của bạn
                    </Text>
                  ) : null}

                  <View
                    style={{ borderColor: cuaMinh ? MAU.vang : MAU.vien }}
                    className="h-14 w-14 items-center justify-center rounded-full border">
                    <BieuTuongCung ma={c.ma} co={28} mau={cuaMinh ? MAU.vangSang : MAU.vang} />
                  </View>

                  <Text
                    style={{ fontFamily: CHU.hoaDam, fontSize: 20, lineHeight: 26 }}
                    className="mt-2.5 text-chu-chinh">
                    {c.ten}
                  </Text>
                  <Text style={{ fontFamily: CHU.than }} className="text-[11px] text-chu-mo">
                    {nd ? `${nd.tu_ngay} – ${nd.den_ngay}` : c.nguyenTo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => router.push('/cung/do-hop')}
            style={{ borderColor: MAU.vien }}
            className="mt-5 flex-row items-center justify-between rounded-2xl border bg-nen-nhat px-5 py-4 active:opacity-75">
            <View className="flex-1 pr-3">
              <Text
                style={{ fontFamily: CHU.thanDam, letterSpacing: 1.3 }}
                className="text-[10px] uppercase text-vang">
                Độ hợp
              </Text>
              <Text style={{ fontFamily: CHU.thanVua }} className="mt-1 text-base text-chu-chinh">
                So hai cung với nhau
              </Text>
            </View>
            <Text className="text-lg text-vang">›</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
