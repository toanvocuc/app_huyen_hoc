/**
 * Logo Omora.
 *
 * Ảnh gốc công ty gửi là nét nâu trên nền xám có kẻ ô, kèm chữ SLOGAN HERE giữ chỗ.
 * Bản dùng trong app đã tách nền, bỏ chữ giữ chỗ và tô lại đúng màu vàng của app.
 * Xem lại cách dựng ở assets/logo/NGUON.md.
 */

import { Image } from 'expo-image';

/** Tỷ lệ thật của hai file, để đặt chiều cao theo chiều ngang mà không méo. */
const TY_LE_DAY_DU = 612 / 768;
const TY_LE_DAU = 600 / 662;

/** Logo đủ chữ OMORA. Dùng ở màn chào mừng và thẻ chia sẻ. */
export function Logo({ rong = 150 }: { rong?: number }) {
  return (
    <Image
      source={require('@/assets/logo/omora-day-du.png')}
      style={{ width: rong, height: rong / TY_LE_DAY_DU }}
      contentFit="contain"
    />
  );
}

/** Chỉ còn hình, không có chữ. Dùng khi tên app đã nằm ngay cạnh. */
export function LogoDau({ rong = 64 }: { rong?: number }) {
  return (
    <Image
      source={require('@/assets/logo/omora-dau.png')}
      style={{ width: rong, height: rong / TY_LE_DAU }}
      contentFit="contain"
    />
  );
}
