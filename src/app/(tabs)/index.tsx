import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { LaBai } from '@/components/la-bai';
import { DangTai, Khoi, ManHinh, Nhan, Trong } from '@/components/nen';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useBoBai } from '@/lib/kho-noi-dung';
import { ghiSuKien } from '@/lib/su-kien';
import { supabase } from '@/lib/supabase';
import { laHomNay, type LaDaRut } from '@/lib/tarot';
import { cungTheoNgay, timCung } from '@/lib/zodiac';

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export default function HomNay() {
  const { boBai, loi, dangTai } = useBoBai();
  const { hoSo } = useHoSo();
  const [la, setLa] = useState<LaDaRut | null>(null);

  useEffect(() => {
    if (!boBai?.length) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setLa(laHomNay(boBai, data.user.id));
      ghiSuKien({ loai: 'xem_ket_qua', manHinh: 'hom-nay' });
    });
  }, [boBai]);

  const d = new Date();
  const ngayChu = `${THU[d.getDay()]}, ngày ${d.getDate()} tháng ${d.getMonth() + 1}`;

  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const maCung = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cung = maCung ? timCung(maCung) : null;

  return (
    <ManHinh tieuDe="Lá bài hôm nay" phu={ngayChu}>
      {dangTai ? <DangTai /> : null}
      {loi ? <Trong loi={`Chưa tải được nội dung. ${loi}`} /> : null}
      {boBai?.length === 0 ? (
        <Trong loi="Kho lá bài đang trống. Nạp data/tarot_78_la.csv vào bảng la_bai rồi mở lại." />
      ) : null}

      {la ? (
        <View>
          <View className="items-center">
            <LaBai daRut={la} rong={200} />
          </View>

          <View className="mt-6">
            <Text className="text-center text-2xl font-bold text-chu-chinh">{la.la.tenVi}</Text>
            <Text className="mt-1.5 text-center text-xs font-semibold uppercase tracking-widest text-vang">
              {la.la.tuKhoa}
            </Text>
          </View>

          <View className="mt-6">
            <Khoi>
              <Text className="text-base leading-7 text-chu-chinh">{la.la.yNghiaXuoi}</Text>
            </Khoi>
          </View>

          <View className="mt-4">
            <Khoi>
              <Nhan>Lời khuyên</Nhan>
              <Text className="text-base leading-7 text-chu-chinh">{la.la.loiKhuyen}</Text>
            </Khoi>
          </View>

          {cung ? (
            <Pressable
              onPress={() => router.push('/cung')}
              className="mt-4 flex-row items-center justify-between rounded-2xl bg-nen-nhat p-5 active:opacity-70">
              <View className="flex-1 pr-3">
                <Nhan>Cung của bạn</Nhan>
                <Text className="text-base text-chu-chinh">{cung.ten} · xem tử vi hôm nay</Text>
              </View>
              <Text className="text-lg text-vang">›</Text>
            </Pressable>
          ) : null}

          <HoiChuyenGia
            manHinh="hom-nay"
            loiMoi={`Lá ${la.la.tenVi} hôm nay ứng vào chuyện gì của bạn? Nhắn cho chuyên gia để hỏi cho rõ.`}
          />
        </View>
      ) : null}
    </ManHinh>
  );
}
