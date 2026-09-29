/** Thanh tiêu đề ở đầu màn: nút lùi bên trái, tên màn căn giữa, đường kẻ mảnh dưới. */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';

export function ThanhTieuDe({
  ten,
  quayLai = true,
  phai,
}: {
  ten: string;
  quayLai?: boolean;
  phai?: React.ReactNode;
}) {
  return (
    <View
      style={{ borderBottomColor: MAU.vien }}
      className="flex-row items-center border-b px-5 pb-3.5 pt-1">
      <View className="w-9">
        {quayLai ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={14}
            className="h-9 w-9 items-center justify-center -ml-2 active:opacity-60">
            <Ionicons name="chevron-back" size={22} color={MAU.chuPhu} />
          </Pressable>
        ) : null}
      </View>

      <Text
        style={{ fontFamily: CHU.thanDam }}
        numberOfLines={1}
        className="flex-1 text-center text-base text-chu-chinh">
        {ten}
      </Text>

      <View className="w-9 items-end">{phai}</View>
    </View>
  );
}

/** Thanh tiến trình từng bước, kiểu các vạch vàng nối nhau. */
export function BuocTienTrinh({
  buoc,
  tong,
  nhan,
  nhanPhai,
}: {
  buoc: number;
  tong: number;
  nhan?: string;
  nhanPhai?: string;
}) {
  return (
    <View className="px-5 pt-5">
      <View className="mb-2.5 flex-row items-center justify-between">
        <Text
          style={{ fontFamily: CHU.thanDam, letterSpacing: 1.4 }}
          className="text-[10px] uppercase text-vang">
          {nhan ?? `Bước ${buoc}/${tong}`}
        </Text>
        {nhanPhai ? (
          <Text
            style={{ fontFamily: CHU.thanVua, letterSpacing: 1.4 }}
            className="text-[10px] uppercase text-chu-mo">
            {nhanPhai}
          </Text>
        ) : null}
      </View>
      <View className="flex-row gap-1.5">
        {Array.from({ length: tong }).map((_, i) => (
          <View
            key={i}
            style={{ backgroundColor: i < buoc ? MAU.vang : MAU.vien }}
            className="h-[3px] flex-1 rounded-full"
          />
        ))}
      </View>
    </View>
  );
}
