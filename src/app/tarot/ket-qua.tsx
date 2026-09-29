import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { LaBai } from '@/components/la-bai';
import { Khoi, ManHinh, Nhan, Nut, Trong } from '@/components/nen';
import { layPhien } from '@/lib/phien-rut';
import { ghiSuKien } from '@/lib/su-kien';
import { maNguoiDung, supabase } from '@/lib/supabase';
import { yNghia } from '@/lib/tarot';

export default function KetQua() {
  const phien = layPhien();
  const [dangXem, setDangXem] = useState(0);

  useEffect(() => {
    if (!phien) return;
    ghiSuKien({ loai: 'xem_ket_qua', manHinh: `tarot-${phien.cacLa.length}-la` });
    luuLanRut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function luuLanRut() {
    if (!phien) return;
    try {
      const ma = await maNguoiDung();
      if (!ma) return;
      await supabase.from('lan_rut').insert({
        nguoi_dung: ma,
        kieu_trai: phien.cacLa.length === 1 ? 'mot-la' : 'ba-la',
        cac_la: phien.cacLa.map((l) => ({ ma: l.la.ma, nguoc: l.nguoc, vi_tri: l.viTri })),
        cau_hoi: phien.cauHoi || null,
      });
    } catch (e) {
      console.warn('[lan-rut]', e);
    }
  }

  if (!phien) {
    return (
      <ManHinh quayLai tieuDe="Kết quả">
        <Trong loi="Chưa có lần rút nào. Quay lại chọn kiểu trải rồi rút một lần." />
      </ManHinh>
    );
  }

  const nhieuLa = phien.cacLa.length > 1;
  const dang = phien.cacLa[dangXem];

  return (
    <ManHinh quayLai tieuDe={nhieuLa ? 'Ba lá của bạn' : 'Lá bài của bạn'} phu={phien.cauHoi || undefined}>
      {nhieuLa ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5">
          <View className="flex-row gap-3 px-5">
            {phien.cacLa.map((l, i) => (
              <Pressable key={l.la.ma} onPress={() => setDangXem(i)} className="active:opacity-70">
                <View className={i === dangXem ? '' : 'opacity-45'}>
                  <LaBai daRut={l} rong={96} nhan />
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="items-center">
          <LaBai daRut={dang} rong={200} />
        </View>
      )}

      <View className="mt-7">
        {nhieuLa ? <Nhan>{dang.viTri}</Nhan> : null}
        <Text className="text-2xl font-bold text-chu-chinh">
          {dang.la.tenVi}
          {dang.nguoc ? ' (ngược)' : ''}
        </Text>
        <Text className="mt-1.5 text-xs font-semibold uppercase tracking-widest text-vang">
          {dang.la.tuKhoa}
        </Text>
      </View>

      <View className="mt-5 gap-4">
        <Khoi>
          <Nhan>Ý nghĩa</Nhan>
          <Text className="text-base leading-7 text-chu-chinh">{yNghia(dang)}</Text>
        </Khoi>
        <Khoi>
          <Nhan>Tình cảm</Nhan>
          <Text className="text-base leading-7 text-chu-chinh">{dang.la.tinhCam}</Text>
        </Khoi>
        <Khoi>
          <Nhan>Công việc</Nhan>
          <Text className="text-base leading-7 text-chu-chinh">{dang.la.congViec}</Text>
        </Khoi>
        <Khoi>
          <Nhan>Lời khuyên</Nhan>
          <Text className="text-base leading-7 text-chu-chinh">{dang.la.loiKhuyen}</Text>
        </Khoi>
      </View>

      <View className="mt-6 flex-row gap-3">
        <View className="flex-1">
          <Nut nhan="Rút lại" kieu="vien" onPress={() => router.replace('/(tabs)/tarot')} />
        </View>
        <View className="flex-1">
          <Nut nhan="Lưu ảnh" onPress={() => router.push('/chia-se')} />
        </View>
      </View>

      <HoiChuyenGia
        manHinh="tarot"
        loiMoi={`Muốn hiểu sâu hơn về ${dang.la.tenVi}? Nhắn cho chuyên gia để hỏi theo đúng chuyện của bạn.`}
      />
    </ManHinh>
  );
}
