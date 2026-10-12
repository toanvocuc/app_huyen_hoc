/**
 * Dòng nhỏ ở cuối màn Cá nhân, cho biết máy đang chạy bản nào.
 *
 * Sinh ra để trả lời đúng một câu hỏi cứ lặp lại: "đẩy cập nhật rồi, máy tôi
 * nhận chưa?". Trước đây cách duy nhất là mò xem giao diện có đổi không, mà
 * đổi nhỏ thì không nhìn ra.
 *
 * Giờ nhìn giờ phát hành là biết. Chưa đổi thì đóng hẳn app rồi mở lại —
 * expo-updates tải ngầm ở lần mở này và chỉ chạy bản mới ở lần mở sau.
 *
 * Khách thật cũng cần dòng này: báo lỗi mà kèm được số bản thì đỡ phải đoán.
 */

import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Text } from 'react-native';

import { CHU } from '@/constants/giao-dien';

function luc(d: Date | null): string {
  if (!d) return '';
  const hai = (n: number) => String(n).padStart(2, '0');
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)} ${hai(d.getHours())}:${hai(d.getMinutes())}`;
}

export function DongPhienBan() {
  const ban = Constants.expoConfig?.version ?? '—';

  // Bản gốc là bản nằm sẵn trong file cài đặt, chưa nhận cập nhật nào.
  const goc = Updates.isEmbeddedLaunch;
  const mo = goc ? 'bản gốc' : `cập nhật ${luc(Updates.createdAt)}`;

  return (
    <Text
      style={{ fontFamily: CHU.than }}
      className="mt-3 text-center text-[10px] leading-4 text-chu-mo">
      Omora {ban} · {mo}
    </Text>
  );
}
