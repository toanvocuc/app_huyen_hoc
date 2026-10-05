import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { DangTai, Khoi, ManHinh, Nhan, Trong } from '@/components/nen';
import { NenKhungCung } from '@/components/nen-anh';
import { CHU, MAU } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useDoHop } from '@/lib/kho-noi-dung';
import { CUNG, cungTheoNgay, diemHop, timCung, type MaCung } from '@/lib/zodiac';

/** Gọi tên từng mức điểm. Năm vạch vàng không tự nói lên điều gì. */
const MUC: Record<number, string> = {
  1: 'Lệch nhau nhiều',
  2: 'Hay va chạm',
  3: 'Vừa phải',
  4: 'Khá hợp',
  5: 'Rất hợp',
};

export default function DoHop() {
  const { hoSo } = useHoSo();
  const { dong, loi, dangTai } = useDoHop();
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const cuaToi = (ns ? cungTheoNgay(ns.ngay, ns.thang) : null) ?? 'aries';

  const [a, setA] = useState<MaCung>(cuaToi);
  const [b, setB] = useState<MaCung>('leo');

  const binh = dong?.find(
    (d) => (d.cung_a === a && d.cung_b === b) || (d.cung_a === b && d.cung_b === a)
  );
  const diem = binh?.diem ?? diemHop(a, b);

  return (
    <ManHinh quayLai nenPhu={<NenKhungCung />} tieuDe="Độ hợp" phu="Chọn hai cung để xem hai người hợp nhau tới đâu.">
      <ChonCung nhan="Cung của bạn" gia={a} dat={setA} />
      <View className="mt-5">
        <ChonCung nhan="Cung của người ấy" gia={b} dat={setB} />
      </View>

      <View className="mt-7">
        {dangTai ? (
          <DangTai />
        ) : loi ? (
          <Trong loi={`Chưa tải được nội dung. ${loi}`} />
        ) : (
          <View className="gap-4">
            <Khoi vien>
              <Text
                style={{ fontFamily: CHU.hoaDam, fontSize: 26, lineHeight: 32 }}
                className="text-center text-chu-chinh">
                {timCung(a).ten} và {timCung(b).ten}
              </Text>
              <View className="mt-3 flex-row justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={{ backgroundColor: i <= diem ? MAU.vang : MAU.vien }}
                    className="h-2.5 w-9 rounded-full"
                  />
                ))}
              </View>
              <Text
                style={{ fontFamily: CHU.thanDam, letterSpacing: 1.4 }}
                className="mt-2.5 text-center text-[11px] uppercase text-vang">
                {diem} trên 5 · {MUC[diem]}
              </Text>
              {binh ? (
                <Text
                  style={{ fontFamily: CHU.than }}
                  className="mt-4 text-base leading-7 text-chu-chinh">
                  {binh.loi_binh}
                </Text>
              ) : null}
            </Khoi>

            {binh?.diem_manh ? (
              <Khoi>
                <Nhan>Được ở chỗ</Nhan>
                <Text
                  style={{ fontFamily: CHU.than }}
                  className="text-[15px] leading-7 text-chu-chinh">
                  {binh.diem_manh}
                </Text>
              </Khoi>
            ) : null}

            {binh?.diem_yeu ? (
              <Khoi>
                <Nhan>Dễ vướng ở chỗ</Nhan>
                <Text
                  style={{ fontFamily: CHU.than }}
                  className="text-[15px] leading-7 text-chu-chinh">
                  {binh.diem_yeu}
                </Text>
              </Khoi>
            ) : null}

            {binh?.loi_khuyen ? (
              <Khoi vien>
                <Nhan>Lời khuyên</Nhan>
                <Text
                  style={{ fontFamily: CHU.than }}
                  className="text-[15px] leading-7 text-chu-chinh">
                  {binh.loi_khuyen}
                </Text>
              </Khoi>
            ) : null}
          </View>
        )}
      </View>

      <HoiChuyenGia
        manHinh="do-hop"
        loiMoi="Muốn xem kỹ hơn chuyện hai người? Nhắn cho chuyên gia để hỏi theo lá số thật."
      />
    </ManHinh>
  );
}

function ChonCung({
  nhan,
  gia,
  dat,
}: {
  nhan: string;
  gia: MaCung;
  dat: (v: MaCung) => void;
}) {
  return (
    <View>
      <Nhan>{nhan}</Nhan>
      <View className="flex-row flex-wrap gap-2">
        {CUNG.map((c) => {
          const chon = gia === c.ma;
          return (
            <Pressable
              key={c.ma}
              onPress={() => dat(c.ma)}
              className={`min-h-[40px] justify-center rounded-full border px-3.5 active:opacity-70 ${
                chon ? 'border-vang bg-vang/15' : 'border-vien bg-nen-nhat'
              }`}>
              <Text
                style={{ fontFamily: chon ? CHU.thanDam : CHU.than }}
                className={`text-sm ${chon ? 'text-vang' : 'text-chu-phu'}`}>
                {c.ten}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
