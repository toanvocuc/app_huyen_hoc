/**
 * Mở Zalo để khách nhắn cho thầy.
 *
 * Tách ra khỏi component vì giờ có hai chỗ gọi: khối mời ở cuối màn kết quả, và
 * nút trong hồ sơ thầy. Hai chỗ đó dùng số Zalo khác nhau — khối mời dùng số
 * chung, hồ sơ dùng số riêng của từng thầy — nên không gộp được bằng cách để
 * nguyên trong component.
 *
 * Về đo đếm: khách bấm sang Zalo rồi thì app không theo dõi được nữa. Mỗi lần
 * bấm sinh một mã ngắn, chép sẵn vào lời nhắn. Người trực Zalo ghi mã đó lại là
 * khớp được hai đầu. Bỏ mã đi thì con số báo lên chỉ là số lượt bấm, không phải
 * số khách thật.
 */

import * as Clipboard from 'expo-clipboard';
import { Alert, Linking } from 'react-native';

import { ghiLuotBamZalo } from '@/lib/su-kien';

/** Số dùng khi thầy chưa khai số riêng. */
export const ZALO_CHUNG = process.env.EXPO_PUBLIC_ZALO_CONG_TY ?? '';

export async function moZalo(soZalo: string | null | undefined, manHinh: string) {
  const so = soZalo?.trim() || ZALO_CHUNG;

  // Mã chỉ chép cho khách khi máy chủ đã nhận. Chép mã mà không ghi được thì
  // người trực Zalo tra không ra, còn con số phễu báo lên sếp thì hụt.
  const ma = await ghiLuotBamZalo(manHinh);
  await Clipboard.setStringAsync(ma ? `Mình đến từ app, mã ${ma}` : 'Mình đến từ app');

  if (!so) {
    Alert.alert('Chưa có số Zalo', 'Chưa khai số Zalo cho thầy này.');
    return;
  }
  const duong = `https://zalo.me/${so}`;
  if (!(await Linking.canOpenURL(duong))) {
    Alert.alert('Không mở được Zalo', 'Máy chưa cài Zalo hoặc bị chặn.');
    return;
  }
  await Linking.openURL(duong);
}
