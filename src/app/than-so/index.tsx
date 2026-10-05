import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Trong, VanNgan } from '@/components/nen';
import { NenKhungSo } from '@/components/nen-anh';
import { OVuongSinh } from '@/components/o-vuong-sinh';
import { VongSo } from '@/components/vong-so';
import { CHU, MAU } from '@/constants/giao-dien';
import { maDuong, mucDo, tinhBieuDo } from '@/lib/bieu-do-ngay-sinh';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useConSo, useMuiTen, useSoChuDao, useSoVanMenh } from '@/lib/kho-noi-dung';
import { soChuDao, soVanMenh } from '@/lib/numerology';

type Tab = 'chu-dao' | 'van-menh' | 'bieu-do';

const CAC_TAB: [Tab, string][] = [
  ['chu-dao', 'Chủ đạo'],
  ['van-menh', 'Vận mệnh'],
  ['bieu-do', 'Biểu đồ'],
];

export default function ThanSo() {
  const { hoSo } = useHoSo();
  const chuDao = useSoChuDao();
  const vanMenh = useSoVanMenh();
  const muiTen = useMuiTen();
  const conSo = useConSo();
  // Mở thẳng một thẻ bằng đường dẫn, ví dụ /than-so?the=bieu-do. Cần cho nút
  // chia sẻ và cho lúc chụp màn hình, vì thẻ nào đang mở là trạng thái trong màn.
  const { the } = useLocalSearchParams<{ the?: string }>();
  const theBanDau = CAC_TAB.some(([ma]) => ma === the) ? (the as Tab) : 'chu-dao';
  const [tab, setTab] = useState<Tab>(theBanDau);
  const [oDangChon, setODangChon] = useState<number | null>(null);

  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const soCD = ns ? soChuDao(ns.ngay, ns.thang, ns.nam) : null;
  const soVM = hoSo?.ho_ten ? soVanMenh(hoSo.ho_ten) : null;

  const noiDungCD = chuDao.dong?.find((d) => d.so === soCD);
  const noiDungVM = vanMenh.dong?.find((d) => d.so === soVM);

  const bieuDo = useMemo(
    () => (ns ? tinhBieuDo(ns.ngay, ns.thang, ns.nam) : null),
    [ns?.ngay, ns?.thang, ns?.nam]
  );

  // Ô mở sẵn là ô lặp nhiều nhất, vì đó là chỗ đáng đọc trước. Chạm ô khác thì đổi.
  const oMacDinh = useMemo(() => {
    if (!bieuDo) return null;
    let tot: number | null = null;
    for (let n = 1; n <= 9; n++) {
      if (bieuDo.dem[n] > 0 && (tot === null || bieuDo.dem[n] > bieuDo.dem[tot])) tot = n;
    }
    return tot;
  }, [bieuDo]);

  const oXem = oDangChon ?? oMacDinh;
  const noiDungO = conSo.dong?.find((c) => c.so === oXem);

  const laChuDao = tab === 'chu-dao';
  const laVanMenh = tab === 'van-menh';
  const laBieuDo = tab === 'bieu-do';
  const loiNoiDung = laBieuDo ? (muiTen.loi ?? conSo.loi) : (chuDao.loi ?? vanMenh.loi);
  const so = laChuDao ? soCD : soVM;
  const ten = laChuDao ? noiDungCD?.ten : noiDungVM?.ten;

  if (!ns) {
    return (
      <ManHinh quayLai tieuDe="Thần số học">
        <Trong loi="Chưa có ngày sinh nên chưa tính được số chủ đạo." />
      </ManHinh>
    );
  }

  /** Tìm câu chữ của một đường, ví dụ '1-5-9' lúc đủ ba số hoặc lúc trống cả ba. */
  const timMuiTen = (cacSo: string, loai: 'day' | 'trong') =>
    muiTen.dong?.find((m) => m.cac_so === cacSo && m.loai === loai);

  return (
    <ManHinh quayLai nenPhu={<NenKhungSo />}>
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
        {CAC_TAB.map(([ma, nhan]) => {
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

      {laBieuDo && bieuDo ? (
        <View className="mt-8 items-center">
          <OVuongSinh
            dem={bieuDo.dem}
            duongDay={bieuDo.duongDay}
            duongTrong={bieuDo.duongTrong}
            dangChon={oXem}
            onChon={setODangChon}
          />
          <Text
            style={{ fontFamily: CHU.thanDam, letterSpacing: 1.6 }}
            className="mt-4 text-[11px] uppercase text-vang">
            Chạm vào một ô để đọc
          </Text>
        </View>
      ) : (
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
      )}

      <VanNgan />

      <View className="gap-4">
        {laBieuDo ? (
          muiTen.dangTai || conSo.dangTai ? (
            <DangTai />
          ) : null
        ) : chuDao.dangTai || vanMenh.dangTai ? (
          <DangTai />
        ) : null}

        {/* Bảng chữ nghĩa nằm trên máy chủ. Mất mạng hoặc chưa nạp bảng thì phải nói ra,
            không thì màn hình trống trơn mà khách không hiểu vì sao. */}
        {loiNoiDung ? <Trong loi={`Chưa tải được nội dung. ${loiNoiDung}`} /> : null}

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

        {laVanMenh && noiDungVM ? (
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

        {laVanMenh && !hoSo?.ho_ten ? (
          <Trong loi="Chưa có họ tên nên chưa tính được số vận mệnh." />
        ) : null}

        {laBieuDo && bieuDo ? (
          <>
            {noiDungO && oXem ? (
              <Khoi vien>
                <Nhan>
                  {`Số ${oXem} · ${noiDungO.ten} · ${
                    bieuDo.dem[oXem] === 0 ? 'không có' : `${bieuDo.dem[oXem]} lần`
                  }`}
                </Nhan>
                <ChuThan>
                  {
                    {
                      thieu: noiDungO.khi_thieu,
                      co: noiDungO.khi_co,
                      nhieu: noiDungO.khi_nhieu,
                    }[mucDo(bieuDo.dem[oXem])]
                  }
                </ChuThan>
              </Khoi>
            ) : null}

            {bieuDo.duongDay.length > 0 ? (
              <>
                <Text
                  style={{ fontFamily: CHU.hoaDam, fontSize: 24, lineHeight: 30 }}
                  className="mt-2 text-chu-chinh">
                  Mũi tên mạnh
                </Text>
                {bieuDo.duongDay.map((d) => {
                  const m = timMuiTen(maDuong(d), 'day');
                  if (!m) return null;
                  return (
                    <Khoi key={m.ma}>
                      <Nhan>{`${m.ten} · ${m.cac_so}`}</Nhan>
                      <ChuThan>{m.y_nghia}</ChuThan>
                      <View className="mt-3">
                        <ChuThan mo>{m.loi_khuyen}</ChuThan>
                      </View>
                    </Khoi>
                  );
                })}
              </>
            ) : null}

            {bieuDo.duongTrong.length > 0 ? (
              <>
                <Text
                  style={{ fontFamily: CHU.hoaDam, fontSize: 24, lineHeight: 30 }}
                  className="mt-2 text-chu-chinh">
                  Mũi tên thiếu
                </Text>
                {bieuDo.duongTrong.map((d) => {
                  const m = timMuiTen(maDuong(d), 'trong');
                  if (!m) return null;
                  return (
                    <Khoi key={m.ma}>
                      <Nhan>{`${m.ten} · ${m.cac_so}`}</Nhan>
                      <ChuThan>{m.y_nghia}</ChuThan>
                      <View className="mt-3">
                        <ChuThan mo>{m.loi_khuyen}</ChuThan>
                      </View>
                    </Khoi>
                  );
                })}
              </>
            ) : null}

            {bieuDo.duongDay.length === 0 && bieuDo.duongTrong.length === 0 ? (
              <Trong loi="Ngày sinh của bạn không tạo thành mũi tên nào, cả mạnh lẫn thiếu. Các mặt trong biểu đồ khá đều nhau, không chỗ nào trội hẳn mà cũng không chỗ nào hụt hẳn." />
            ) : null}
          </>
        ) : null}
      </View>

      <HoiChuyenGia
        manHinh="than-so-hoc"
        loiMoi={
          laBieuDo
            ? 'Biểu đồ ngày sinh của bạn nói gì về năm nay? Nhắn cho chuyên gia để hỏi kỹ hơn.'
            : `Số ${so ?? ''} nói gì về năm nay của bạn? Nhắn cho chuyên gia để hỏi kỹ hơn.`
        }
      />
    </ManHinh>
  );
}
