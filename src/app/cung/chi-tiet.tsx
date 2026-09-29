/** Chi tiết một cung: ký hiệu, mốc ngày, bốn thanh chỉ số, tính cách, điểm mạnh yếu. */

import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { ChuThan, Khoi, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { ThanhTieuDe } from '@/components/thanh-tieu-de';
import { CHU, MAU, NEN_CHUYEN } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useCung } from '@/lib/kho-noi-dung';
import { cungTheoNgay, diemHop, timCung, type MaCung } from '@/lib/zodiac';

/**
 * Bốn chỉ số suy từ nguyên tố và tính chất của cung, không phải số bịa ra mỗi lần mở.
 * Cùng một cung thì lúc nào cũng ra cùng một bộ số.
 */
function chiSo(ma: MaCung) {
  const c = timCung(ma);
  const nen = { 'Hoả': [78, 88, 82, 86], 'Khí': [84, 80, 76, 88], 'Thổ': [74, 92, 86, 78], 'Thuỷ': [90, 74, 80, 82] }[
    c.nguyenTo
  ];
  const lech = c.ma.length % 5; // xê dịch nhẹ để các cung cùng nguyên tố không giống hệt nhau
  return {
    tinhDuyen: nen[0] + lech,
    suNghiep: nen[1] - lech,
    sucKhoe: nen[2] + ((lech + 2) % 4),
    mayMan: nen[3] - ((lech + 1) % 4),
  };
}

export default function ChiTietCung() {
  const { ma } = useLocalSearchParams<{ ma: MaCung }>();
  const { hoSo } = useHoSo();
  const { dong } = useCung();

  const cung = ma ? timCung(ma) : null;
  const nd = dong?.find((x) => x.ma === ma);
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const cuaToi = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cs = ma ? chiSo(ma) : null;

  if (!cung || !cs) {
    return (
      <LinearGradient colors={NEN_CHUYEN} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ThanhTieuDe ten="Cung hoàng đạo" />
          <View className="px-5 pt-6">
            <Trong loi="Không tìm thấy cung này." />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThanhTieuDe ten={cung.ten} />

        <ScrollView contentContainerClassName="px-5 pb-14 pt-7">
          <View className="items-center">
            <View
              style={{ borderColor: MAU.vangMo }}
              className="h-24 w-24 items-center justify-center rounded-full border">
              <BieuTuongCung ma={cung.ma} co={48} />
            </View>
            <Text
              style={{ fontFamily: CHU.hoaDam, fontSize: 38, lineHeight: 44 }}
              className="mt-4 text-chu-chinh">
              {cung.ten}
            </Text>
            <View className="mt-2 flex-row items-center gap-2">
              <View
                style={{ borderColor: MAU.vangMo }}
                className="rounded-full border px-2.5 py-0.5">
                <Text
                  style={{ fontFamily: CHU.thanDam, letterSpacing: 1 }}
                  className="text-[10px] uppercase text-vang">
                  {nd?.ten_en ?? cung.nguyenTo}
                </Text>
              </View>
              <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-phu">
                {nd ? `${nd.tu_ngay} – ${nd.den_ngay}` : ''} · {cung.nguyenTo}
              </Text>
            </View>
          </View>

          <VanNgan />

          <View className="flex-row flex-wrap justify-between gap-y-5">
            <Chi nhan="Tình duyên" gia={cs.tinhDuyen} />
            <Chi nhan="Sự nghiệp" gia={cs.suNghiep} />
            <Chi nhan="Sức khoẻ" gia={cs.sucKhoe} />
            <Chi nhan="May mắn" gia={cs.mayMan} />
          </View>

          {nd ? (
            <View className="mt-7 gap-4">
              <Khoi>
                <Nhan>Tính cách</Nhan>
                <ChuThan>{nd.tinh_cach}</ChuThan>
              </Khoi>
              <Khoi>
                <Nhan>Điểm mạnh</Nhan>
                <ChuThan>{nd.diem_manh}</ChuThan>
              </Khoi>
              <Khoi>
                <Nhan>Điểm yếu</Nhan>
                <ChuThan>{nd.diem_yeu}</ChuThan>
              </Khoi>
            </View>
          ) : null}

          {cuaToi && cuaToi !== cung.ma ? (
            <View className="mt-4">
              <Khoi vien>
                <Nhan>So với cung của bạn</Nhan>
                <ChuThan>
                  {timCung(cuaToi).ten} và {cung.ten} hợp nhau {diemHop(cuaToi, cung.ma)} trên 5.
                </ChuThan>
                <View className="mt-4">
                  <Nut nhan="Xem độ hợp" kieu="vien" onPress={() => router.push('/cung/do-hop')} />
                </View>
              </Khoi>
            </View>
          ) : null}

          <HoiChuyenGia
            manHinh="chi-tiet-cung"
            loiMoi={`Là ${cung.ten} thì điều gì đang chờ bạn tháng này? Nhắn cho chuyên gia để hỏi cho rõ.`}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/** Một chỉ số: tên, phần trăm, và thanh ngang. */
function Chi({ nhan, gia }: { nhan: string; gia: number }) {
  return (
    <View style={{ width: '47%' }}>
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-phu">
          {nhan}
        </Text>
        <Text style={{ fontFamily: CHU.thanDam }} className="text-sm text-chu-chinh">
          {gia}%
        </Text>
      </View>
      <View style={{ backgroundColor: MAU.vien }} className="h-1.5 overflow-hidden rounded-full">
        <View
          style={{ width: `${gia}%`, backgroundColor: MAU.vang }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
}
