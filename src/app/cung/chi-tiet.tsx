/** Chi tiết một cung: ký hiệu, mốc ngày, bốn thanh chỉ số, tính cách, điểm mạnh yếu. */

import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { ChuThan, DangTai, Khoi, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { NenKhungCung } from '@/components/nen-anh';
import { ThanhTieuDe } from '@/components/thanh-tieu-de';
import { CHU, MAU, NEN_CHUYEN } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useCung, useTuVi, type DongTuVi } from '@/lib/kho-noi-dung';
import { layBaiTuVi, ngayChu, tuanChu } from '@/lib/tu-vi';
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
  // `ky` cho phép mở thẳng thẻ tuần bằng đường dẫn, ví dụ /cung/chi-tiet?ma=virgo&ky=tuan.
  const { ma, ky: kyBanDau } = useLocalSearchParams<{ ma: MaCung; ky?: string }>();
  const { hoSo } = useHoSo();
  const { dong, loi } = useCung();
  const tuVi = useTuVi();
  const [ky, setKy] = useState<'ngay' | 'tuan'>(kyBanDau === 'tuan' ? 'tuan' : 'ngay');

  const cung = ma ? timCung(ma) : null;
  const nd = dong?.find((x) => x.ma === ma);
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const cuaToi = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cs = ma ? chiSo(ma) : null;
  const le = useSafeAreaInsets();

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
      <NenKhungCung />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThanhTieuDe ten={cung.ten} />

        <ScrollView
          contentContainerClassName="px-5 pt-7"
          contentContainerStyle={{ paddingBottom: 56 + le.bottom }}>
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

          <View className="mt-8">
            <View
              style={{ borderColor: MAU.vien }}
              className="flex-row rounded-full border bg-nen-nhat p-1">
              {(
                [
                  ['ngay', 'Hôm nay'],
                  ['tuan', 'Tuần này'],
                ] as ['ngay' | 'tuan', string][]
              ).map(([v, nhan]) => {
                const dang = ky === v;
                return (
                  <Pressable
                    key={v}
                    onPress={() => setKy(v)}
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

            <Text
              style={{ fontFamily: CHU.than }}
              className="mt-3 text-center text-xs text-chu-mo">
              {ky === 'ngay' ? ngayChu() : `Tuần ${tuanChu()}`}
            </Text>

            {tuVi.dangTai ? (
              <View className="mt-5">
                <DangTai />
              </View>
            ) : tuVi.loi ? (
              <View className="mt-5">
                <Trong loi={`Chưa tải được tử vi. ${tuVi.loi}`} />
              </View>
            ) : (
              <TuVi kho={tuVi.dong} cung={cung.ma} ky={ky} />
            )}
          </View>

          {nd ? (
            <View className="mt-8 gap-4">
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

          {loi ? (
            <View className="mt-7">
              <Trong loi={`Chưa tải được nội dung. ${loi}`} />
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

/** Khối tử vi: điểm sao, mấy con số vui, rồi tới các mục chữ. */
function TuVi({
  kho,
  cung,
  ky,
}: {
  kho: DongTuVi[] | null;
  cung: MaCung;
  ky: 'ngay' | 'tuan';
}) {
  const b = layBaiTuVi(kho, cung, ky);

  if (!b.tongQuan) {
    return (
      <View className="mt-5">
        <Trong loi="Chưa có bài tử vi cho cung này. Nạp data/tu_vi_mau.csv vào bảng tu_vi_mau." />
      </View>
    );
  }

  return (
    <View className="mt-5 gap-4">
      <Khoi vien>
        <View className="mb-3 flex-row justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{ backgroundColor: i <= b.diem ? MAU.vang : MAU.vien }}
              className="h-2.5 w-9 rounded-full"
            />
          ))}
        </View>
        <ChuThan>{b.tongQuan}</ChuThan>
      </Khoi>

      <View className="flex-row gap-3">
        <O nhan="Số may mắn" gia={String(b.soMayMan)} />
        <O nhan="Màu hợp" gia={b.mauMayMan} />
        <O nhan="Giờ tốt" gia={b.gioTot} />
      </View>

      {b.tinhCam ? (
        <Khoi>
          <Nhan>Tình cảm</Nhan>
          <ChuThan>{b.tinhCam}</ChuThan>
        </Khoi>
      ) : null}
      {b.congViec ? (
        <Khoi>
          <Nhan>Công việc và tiền bạc</Nhan>
          <ChuThan>{b.congViec}</ChuThan>
        </Khoi>
      ) : null}
      {b.sucKhoe ? (
        <Khoi>
          <Nhan>Sức khoẻ</Nhan>
          <ChuThan>{b.sucKhoe}</ChuThan>
        </Khoi>
      ) : null}
    </View>
  );
}

/** Một ô nhỏ cho mấy con số vui. */
function O({ nhan, gia }: { nhan: string; gia: string }) {
  return (
    <View
      style={{ borderColor: MAU.vien }}
      className="flex-1 items-center rounded-2xl border bg-nen-nhat px-2 py-3">
      <Text
        style={{ fontFamily: CHU.thanDam, letterSpacing: 1 }}
        className="text-[9px] uppercase text-chu-mo">
        {nhan}
      </Text>
      <Text style={{ fontFamily: CHU.thanDam }} className="mt-1 text-sm text-vang">
        {gia}
      </Text>
    </View>
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
