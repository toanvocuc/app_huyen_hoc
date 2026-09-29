import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { Khoi, ManHinh } from '@/components/man-hinh';
import { useBoBai } from '@/lib/kho-noi-dung';
import { ghiSuKien } from '@/lib/su-kien';
import { rutBai, yNghia, type KieuTrai, type LaDaRut } from '@/lib/tarot';

export default function Tarot() {
  const { boBai, dangTai } = useBoBai();
  const [ketQua, setKetQua] = useState<LaDaRut[] | null>(null);

  function rut(kieu: KieuTrai) {
    if (!boBai?.length) return;
    setKetQua(rutBai(boBai, kieu));
    ghiSuKien({ loai: 'xem_ket_qua', manHinh: `tarot-${kieu}` });
  }

  return (
    <ManHinh tieuDe="Rút bài" phu="Nghĩ về câu hỏi của bạn rồi chọn kiểu trải">
      {dangTai ? <ActivityIndicator color="#C9A227" /> : null}

      <View className="flex-row gap-3">
        <Nut nhan="Một lá" onPress={() => rut('mot-la')} />
        <Nut nhan="Ba lá" onPress={() => rut('ba-la')} />
      </View>

      {/* TODO: hiệu ứng lật bài, hiện ảnh lá từ assets/cards/ */}

      {ketQua ? (
        <View className="mt-6 gap-4">
          {ketQua.map((d) => (
            <Khoi key={d.la.ma}>
              <Text className="text-xs uppercase tracking-widest text-vang">{d.viTri}</Text>
              <Text className="mt-1 text-xl font-bold text-chu-chinh">
                {d.la.tenVi}
                {d.nguoc ? ' (ngược)' : ''}
              </Text>
              <Text className="mt-1 text-sm text-chu-phu">{d.la.tuKhoa}</Text>
              <Text className="mt-4 text-base leading-6 text-chu-chinh">{yNghia(d)}</Text>
            </Khoi>
          ))}

          <HoiChuyenGia
            manHinh="tarot"
            loiMoi={`Muốn hiểu sâu hơn về ${ketQua[0].la.tenVi}? Nhắn cho chuyên gia để hỏi theo đúng chuyện của bạn.`}
          />
        </View>
      ) : null}
    </ManHinh>
  );
}

function Nut({ nhan, onPress }: { nhan: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 rounded-xl bg-vang px-4 py-3 active:opacity-80">
      <Text className="text-center font-semibold text-nen">{nhan}</Text>
    </Pressable>
  );
}
