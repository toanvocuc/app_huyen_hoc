import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { Khoi, ManHinh } from '@/components/man-hinh';
import { useBoBai } from '@/lib/kho-noi-dung';
import { ghiSuKien } from '@/lib/su-kien';
import { supabase } from '@/lib/supabase';
import { laHomNay, ngayVietNam, type LaDaRut } from '@/lib/tarot';

export default function HomNay() {
  const { boBai, loi, dangTai } = useBoBai();
  const [la, setLa] = useState<LaDaRut | null>(null);

  useEffect(() => {
    if (!boBai?.length) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setLa(laHomNay(boBai, data.user.id));
      ghiSuKien({ loai: 'xem_ket_qua', manHinh: 'hom-nay' });
    });
  }, [boBai]);

  return (
    <ManHinh tieuDe="Lá bài hôm nay" phu={ngayVietNam()}>
      {dangTai ? <ActivityIndicator color="#C9A227" /> : null}
      {loi ? <Text className="text-sm text-chu-phu">Chưa tải được nội dung: {loi}</Text> : null}
      {boBai?.length === 0 ? (
        <Text className="text-sm text-chu-phu">
          Kho lá bài đang trống. Nạp data/tarot_78_la.csv vào bảng la_bai.
        </Text>
      ) : null}

      {la ? (
        <View>
          {/* TODO: hiện ảnh lá bài từ assets/cards/ */}
          <Khoi>
            <Text className="text-xs uppercase tracking-widest text-vang">{la.la.bo}</Text>
            <Text className="mt-1 text-xl font-bold text-chu-chinh">{la.la.tenVi}</Text>
            <Text className="mt-1 text-sm text-chu-phu">{la.la.tuKhoa}</Text>
            <Text className="mt-4 text-base leading-6 text-chu-chinh">{la.la.yNghiaXuoi}</Text>
            <Text className="mt-4 text-sm leading-5 text-chu-phu">{la.la.loiKhuyen}</Text>
          </Khoi>

          <HoiChuyenGia
            manHinh="hom-nay"
            loiMoi={`Lá ${la.la.tenVi} hôm nay ứng vào chuyện gì của bạn? Nhắn cho chuyên gia để hỏi rõ.`}
          />
        </View>
      ) : null}
    </ManHinh>
  );
}
