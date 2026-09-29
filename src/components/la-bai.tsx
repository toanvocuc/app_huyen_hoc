/**
 * Hiện một lá bài.
 *
 * Ảnh nằm trong assets/cards/ đặt tên trùng cột `ma` của bảng la_bai.
 * Chưa có ảnh thì hiện khung giữ chỗ có tên lá, để dựng màn hình được ngay
 * mà không phải chờ đủ 78 file.
 */

import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { MAU, TY_LE_LA_BAI } from '@/constants/giao-dien';
import type { LaDaRut } from '@/lib/tarot';

const ANH: Record<string, number> = {
  // Thêm dần khi có ảnh, ví dụ:
  // 'major-00': require('@/assets/cards/major-00.jpg'),
};

export function LaBai({
  daRut,
  rong = 180,
  nhan,
}: {
  daRut: LaDaRut;
  rong?: number;
  nhan?: boolean;
}) {
  const cao = rong / TY_LE_LA_BAI;
  const nguon = ANH[daRut.la.ma];

  return (
    <View style={{ width: rong }}>
      <View
        style={{ width: rong, height: cao }}
        className="overflow-hidden rounded-lg border border-vang/50 bg-nen-nhat-hon">
        {nguon ? (
          <Image
            source={nguon}
            style={{
              width: rong,
              height: cao,
              transform: [{ rotate: daRut.nguoc ? '180deg' : '0deg' }],
            }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center px-2">
            <Text className="text-center text-xs leading-4 text-chu-mo">{daRut.la.tenVi}</Text>
            <Text className="mt-1 text-center text-[10px] text-chu-mo">chưa có ảnh</Text>
          </View>
        )}

        {daRut.nguoc ? (
          <View className="absolute right-1.5 top-1.5 rounded-full bg-vang px-2 py-0.5">
            <Text className="text-[10px] font-bold text-nen">Ngược</Text>
          </View>
        ) : null}
      </View>

      {nhan ? (
        <Text className="mt-2 text-center text-xs font-semibold uppercase tracking-wider text-vang">
          {daRut.viTri}
        </Text>
      ) : null}
    </View>
  );
}

/** Mặt sau, dùng cho màn rút bài lúc chưa lật. */
export function MatSau({ rong = 110 }: { rong?: number }) {
  const cao = rong / TY_LE_LA_BAI;
  return (
    <View
      style={{ width: rong, height: cao, borderColor: MAU.vangMo }}
      className="items-center justify-center rounded-lg border bg-nen-nhat">
      <View
        style={{ width: rong * 0.42, height: rong * 0.42, borderColor: MAU.vangMo }}
        className="rotate-45 rounded-sm border"
      />
    </View>
  );
}
