/**
 * Năm ngôi sao: vừa để hiện điểm, vừa để khách chấm.
 *
 * Một component cho cả hai việc vì chúng phải trông giống hệt nhau. Tách ra là
 * sớm muộn cũng lệch cỡ hoặc lệch màu, mà chỗ chấm điểm nhìn khác chỗ hiện điểm
 * thì khách không nhận ra là bấm được.
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';

export function Sao({
  diem,
  co = 16,
  onChon,
}: {
  /** 0 tới 5. Số lẻ thì làm tròn để vẽ, ví dụ 4,3 vẽ thành bốn sao đầy. */
  diem: number;
  co?: number;
  /** Truyền vào là bấm chấm điểm được. Bỏ trống thì chỉ để xem. */
  onChon?: (sao: number) => void;
}) {
  const day = Math.round(diem);

  return (
    <View className="flex-row" style={{ gap: onChon ? 10 : 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const bieu = (
          <Ionicons
            name={i <= day ? 'star' : 'star-outline'}
            size={onChon ? co + 12 : co}
            color={i <= day ? MAU.vang : MAU.chuMo}
          />
        );
        return onChon ? (
          <Pressable key={i} onPress={() => onChon(i)} hitSlop={6} className="active:opacity-60">
            {bieu}
          </Pressable>
        ) : (
          <View key={i}>{bieu}</View>
        );
      })}
    </View>
  );
}

/** Sao kèm số, kiểu "4,5 · 12 đánh giá". Chưa ai chấm thì nói thẳng là chưa có. */
export function SaoKemSo({
  diem,
  soLuot,
  co = 14,
}: {
  diem: number | null;
  soLuot: number;
  co?: number;
}) {
  if (!diem || soLuot === 0) {
    return (
      <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-mo">
        Chưa có đánh giá
      </Text>
    );
  }
  return (
    <View className="flex-row items-center gap-2">
      <Sao diem={diem} co={co} />
      <Text style={{ fontFamily: CHU.thanVua }} className="text-xs text-chu-phu">
        {diem.toFixed(1).replace('.', ',')} · {soLuot} đánh giá
      </Text>
    </View>
  );
}
