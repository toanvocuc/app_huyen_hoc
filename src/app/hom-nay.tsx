import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { LaBai } from '@/components/la-bai';
import { NenKhungVan } from '@/components/nen-anh';
import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { CHU } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useBoBai } from '@/lib/kho-noi-dung';
import { ghiSuKien } from '@/lib/su-kien';
import { maNguoiDung } from '@/lib/supabase';
import { datPhien } from '@/lib/phien-rut';
import { laHomNay, type LaDaRut } from '@/lib/tarot';
import { cungTheoNgay, timCung } from '@/lib/zodiac';

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export default function HomNay() {
  const { boBai, loi, dangTai } = useBoBai();
  const { hoSo } = useHoSo();
  const [la, setLa] = useState<LaDaRut | null>(null);

  const [khongDocDuoc, setKhongDocDuoc] = useState(false);

  /**
   * Lá bài của ngày tính từ mã người dùng, nên phải hỏi mã trước.
   *
   * `maNguoiDung` gọi mạng và trả null khi hỏi không xong, chứ không ném lỗi.
   * Bỏ qua nhánh đó thì màn này hiện đúng tiêu đề với ngày tháng rồi hết —
   * không vòng xoay, không báo lỗi, chỉ một mảng trống.
   */
  const timLa = useCallback(() => {
    if (!boBai?.length) return;
    maNguoiDung()
      .then((ma) => {
        if (!ma) {
          setKhongDocDuoc(true);
          return;
        }
        setLa(laHomNay(boBai, ma));
        ghiSuKien({ loai: 'xem_ket_qua', manHinh: 'hom-nay' });
      })
      .catch((e) => {
        console.warn('[hom-nay]', e);
        setKhongDocDuoc(true);
      });
  }, [boBai]);

  useEffect(timLa, [timLa]);

  // Nút thử lại: gỡ cờ báo lỗi rồi hỏi lại. Gỡ cờ nằm ở đây chứ không nằm trong
  // timLa, vì timLa chạy thẳng trong hiệu ứng và đặt trạng thái ngay trong thân
  // hiệu ứng là kéo thêm một vòng vẽ thừa — eslint bắt đúng chỗ này.
  const thuLai = useCallback(() => {
    setKhongDocDuoc(false);
    timLa();
  }, [timLa]);

  const d = new Date();
  const ngayChu = `${THU[d.getDay()]}, ngày ${d.getDate()} tháng ${d.getMonth() + 1}`;

  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const maCung = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cung = maCung ? timCung(maCung) : null;

  return (
    <ManHinh quayLai tieuDe="Lá bài hôm nay" phu={ngayChu} nenPhu={<NenKhungVan />}>
      {dangTai ? <DangTai /> : null}
      {loi ? <Trong loi={`Chưa tải được nội dung. ${loi}`} /> : null}
      {boBai?.length === 0 ? (
        <Trong loi="Kho lá bài đang trống. Nạp data/tarot_78_la.csv vào bảng la_bai rồi mở lại." />
      ) : null}

      {khongDocDuoc ? (
        <View>
          <Trong loi="Chưa đọc được tài khoản của bạn nên chưa biết lá nào là của hôm nay. Kiểm tra mạng giúp tôi." />
          <View className="mt-5">
            <Nut nhan="Thử lại" kieu="vien" onPress={thuLai} />
          </View>
        </View>
      ) : null}

      {la ? (
        <View>
          <View className="items-center">
            <LaBai daRut={la} rong={210} haoQuang />
          </View>

          <View className="mt-6">
            <Text
              style={{ fontFamily: CHU.hoaDam, fontSize: 36, lineHeight: 42 }}
              className="text-center text-chu-chinh">
              {la.la.tenEn}
            </Text>
            <Text
              style={{ fontFamily: CHU.thanDam, letterSpacing: 1.8 }}
              className="mt-2 text-center text-[11px] uppercase text-vang">
              {la.la.tuKhoa}
            </Text>
          </View>

          <VanNgan />

          <Khoi>
            <ChuThan>{la.la.yNghiaXuoi}</ChuThan>
          </Khoi>

          <View className="mt-4">
            <Khoi vien>
              <Nhan>Lời khuyên</Nhan>
              <ChuThan>{la.la.loiKhuyen}</ChuThan>
            </Khoi>
          </View>

          {cung ? (
            <Pressable
              onPress={() => router.push({ pathname: '/cung/chi-tiet', params: { ma: maCung } })}
              className="mt-4 flex-row items-center justify-between rounded-2xl bg-nen-nhat p-5 active:opacity-70">
              <View className="flex-1 pr-3">
                <Nhan>Cung của bạn</Nhan>
                <Text style={{ fontFamily: CHU.than }} className="text-base text-chu-chinh">
                  {cung.ten} · xem tử vi hôm nay
                </Text>
              </View>
              <Text className="text-lg text-vang">›</Text>
            </Pressable>
          ) : null}

          <View className="mt-5">
            <Nut
              nhan="Lưu ảnh để chia sẻ"
              kieu="vien"
              onPress={() => {
                datPhien([la]);
                router.push('/chia-se');
              }}
            />
          </View>

          <HoiChuyenGia
            manHinh="hom-nay"
            loiMoi={`Lá ${la.la.tenEn} hôm nay ứng vào chuyện gì của bạn? Nhắn cho chuyên gia để hỏi cho rõ.`}
          />
        </View>
      ) : null}
    </ManHinh>
  );
}
