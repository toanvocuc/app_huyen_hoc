/**
 * Thông báo đẩy.
 *
 * Chia làm hai đường, vì hai đường này có điều kiện chạy khác hẳn nhau:
 *
 *  1. LỜI NHẮC LÁ BÀI mỗi sáng — hẹn giờ ngay trên máy, không cần máy chủ, không
 *     cần tài khoản Apple, và chạy được cả trong Expo Go.
 *
 *  2. TIN GỬI THEO ĐỢT từ trang quản trị — cần mã thiết bị gửi lên máy chủ. Mã đó
 *     chỉ lấy được trong bản đóng gói thật.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * VÌ SAO IMPORT LẺ TỪNG FILE THAY VÌ `import * as Notifications`
 *
 * `expo-notifications/build/index.js` kéo theo `getExpoPushTokenAsync`, file này
 * lại kéo theo `DevicePushTokenAutoRegistration.fx`. Chữ `.fx` nghĩa là module
 * chạy phụ ngay lúc nạp, và nó gọi `addPushTokenListener` ở cấp module. Hàm đó
 * gọi tiếp `warnOfExpoGoPushUsage`, thứ **ném lỗi** trên Android khi đang chạy
 * Expo Go.
 *
 * Nghĩa là chỉ cần viết `import * as Notifications from 'expo-notifications'` là
 * màn hình chết, chưa cần gọi hàm nào. Màn cài đặt thông báo và màn hoàn tất hồ
 * sơ đều đã dính lỗi đó, mà màn hoàn tất nằm giữa luồng nhập hồ sơ nên khách mới
 * không đi tiếp được.
 *
 * Mấy file thông báo tại chỗ bên dưới không dính chuỗi đó, nên import lẻ từng
 * file là chạy được cả trong Expo Go. Riêng phần lấy mã thiết bị thì nạp muộn
 * bằng `await import`, và chỉ nạp khi đã qua `vuongMacMaDay`.
 *
 * Đổi phiên bản expo-notifications thì kiểm lại mấy đường dẫn này. Sai đường dẫn
 * thì Metro báo không tìm thấy module ngay lúc đóng gói, không im lặng bỏ qua.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

/** Một mã cố định, để đổi giờ thì thay đúng lời nhắc cũ chứ không chồng thêm cái mới. */
const MA_NHAC_LA_BAI = 'nhac-la-bai-hom-nay';

/** Tên kênh trên Android. Thiếu kênh thì thông báo hiện lặng lẽ, khách không thấy. */
const KENH = 'la-bai-hom-nay';

/**
 * Lời nhắc đổi theo ngày cho đỡ nhàm.
 *
 * Cố ý không nói luôn ra lá nào. Lời nhắc chỉ để khách mở app, biết trước rồi thì
 * chẳng còn lý do mở nữa.
 */
const LOI_NHAC = [
  { tieuDe: 'Lá bài hôm nay đang chờ bạn', than: 'Mở ra xem hôm nay bộ bài nói gì.' },
  { tieuDe: 'Hôm nay bạn rút được lá gì', than: 'Một lá cho cả ngày, mở ra xem thử.' },
  { tieuDe: 'Bộ bài có lời cho hôm nay', than: 'Mất ba mươi giây để biết.' },
  { tieuDe: 'Chào buổi sáng', than: 'Lá bài của ngày hôm nay đã sẵn sàng.' },
  { tieuDe: 'Một lá cho hôm nay', than: 'Xem rồi hẵng bắt đầu ngày mới.' },
];

/** Tách chuỗi '07:00' hoặc '07:00:00' thành giờ và phút. */
export function tachGio(gio: string | null | undefined): { gio: number; phut: number } {
  const [g, p] = (gio ?? '07:00').split(':');
  const soGio = Number(g);
  const soPhut = Number(p);
  return {
    gio: Number.isFinite(soGio) ? Math.min(23, Math.max(0, soGio)) : 7,
    phut: Number.isFinite(soPhut) ? Math.min(59, Math.max(0, soPhut)) : 0,
  };
}

/**
 * Cho phép hiện thông báo cả khi app đang mở.
 *
 * Mặc định expo-notifications NUỐT mọi thông báo nổ lúc app đang ở trước mặt.
 * Nó giao cho app tự quyết, mà không khai thì mặc định là không hiện gì.
 *
 * Chuyện này từng làm nút gửi thử trong màn cài đặt trông như hỏng: tin nổ sau
 * năm giây mà người bấm vẫn đang nhìn màn hình, nên không thấy gì. Nút đó đã bỏ,
 * nhưng khai báo vẫn cần: lời nhắc bảy giờ sáng có thể nổ đúng lúc khách đang mở
 * app, và lúc đó nó cũng sẽ bị nuốt y như vậy.
 *
 * Trên Android phải để `shouldPlaySound` là true: tài liệu của thư viện ghi rõ
 * đặt false thì dải thông báo không bung ra, bất kể mức ưu tiên.
 */
export function batHienKhiDangMo() {
  if (XEM_THU) return;
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Android phải khai kênh trước, không thì thông báo không kêu và không hiện trên màn khoá. */
async function taoKenh() {
  if (Platform.OS !== 'android') return;
  await setNotificationChannelAsync(KENH, {
    name: 'Lá bài hôm nay',
    importance: AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#D4A84B',
  });
}

/** Đã được cấp quyền chưa. Không hỏi, chỉ xem. */
export async function daCoQuyen(): Promise<boolean> {
  if (XEM_THU) return false;
  try {
    const { granted } = await getPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

/**
 * Hỏi quyền gửi thông báo.
 *
 * Chỉ gọi hàm này SAU khi đã giải thích cho khách vì sao cần. Hộp thoại của hệ
 * điều hành chỉ hiện đúng một lần, khách bấm Không là lần sau phải vào tận phần
 * cài đặt của máy mới bật lại được.
 */
export async function xinQuyen(): Promise<boolean> {
  if (XEM_THU) return false;
  try {
    const dangCo = await getPermissionsAsync();
    if (dangCo.granted) return true;
    if (!dangCo.canAskAgain) return false;

    const { granted } = await requestPermissionsAsync();
    if (granted) await taoKenh();
    return granted;
  } catch (e) {
    console.warn('[thong-bao] xin quyen that bai:', e);
    return false;
  }
}

/** Hẹn lời nhắc lá bài mỗi ngày vào đúng giờ khách chọn. */
export async function datLichLaBai(gioNhac: string | null): Promise<boolean> {
  if (XEM_THU) return false;
  if (!(await daCoQuyen())) return false;

  await taoKenh();
  await huyLichLaBai();

  const { gio, phut } = tachGio(gioNhac);
  const loi = LOI_NHAC[Math.floor(Math.random() * LOI_NHAC.length)];

  await scheduleNotificationAsync({
    identifier: MA_NHAC_LA_BAI,
    content: { title: loi.tieuDe, body: loi.than, data: { man: '/' } },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: gio,
      minute: phut,
      channelId: KENH,
    },
  });
  return true;
}

export async function huyLichLaBai() {
  if (XEM_THU) return;
  try {
    await cancelScheduledNotificationAsync(MA_NHAC_LA_BAI);
  } catch {
    // Chưa hẹn lần nào thì huỷ sẽ báo lỗi. Không phải chuyện gì.
  }
}

/** Đang hẹn lời nhắc nào chưa. Dùng để màn cài đặt hiện đúng trạng thái thật. */
export async function dangHenLaBai(): Promise<boolean> {
  if (XEM_THU) return false;
  try {
    const ds = await getAllScheduledNotificationsAsync();
    return ds.some((n) => n.identifier === MA_NHAC_LA_BAI);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- tin gửi theo đợt

/** Chạy được phần gửi theo đợt không. Trả về lý do nếu không, để màn cài đặt nói rõ. */
export function vuongMacMaDay(): string | null {
  if (XEM_THU) return 'Đang ở chế độ xem thử.';
  if (isRunningInExpoGo()) {
    return 'Expo Go không nhận được tin gửi theo đợt. Phần này chạy khi đã đóng gói app thật.';
  }
  if (!maDuAn()) return 'Chưa chạy eas init nên chưa có mã dự án.';
  return null;
}

function maDuAn(): string | null {
  const ma =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
  // Giá trị giữ chỗ trong app.json không phải mã thật.
  if (!ma || String(ma).startsWith('CHUA_TAO')) return null;
  return String(ma);
}

/**
 * Lấy mã thiết bị rồi lưu lên máy chủ, để trang quản trị gửi tin theo đợt được.
 *
 * Nạp `expo-notifications` ở đây chứ không nạp ở đầu file, vì nạp cả gói là kéo
 * theo module chạy phụ gây lỗi trong Expo Go. Tới dòng này thì đã qua
 * `vuongMacMaDay` nên chắc chắn không còn ở Expo Go nữa.
 *
 * Nuốt mọi lỗi: không lấy được mã thì khách vẫn dùng app bình thường, chỉ là
 * không nhận được tin gửi theo đợt.
 */
export async function dangKyMaDay(): Promise<string | null> {
  if (vuongMacMaDay()) return null;
  if (!(await daCoQuyen())) return null;

  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;

    const { getExpoPushTokenAsync } = await import('expo-notifications');
    const { data: ma } = await getExpoPushTokenAsync({ projectId: maDuAn()! });
    if (!ma) return null;

    const { error } = await supabase.from('thiet_bi').upsert(
      {
        ma_day: ma,
        nguoi_dung: u.user.id,
        nen_tang: Platform.OS,
        cap_nhat_luc: new Date().toISOString(),
      },
      { onConflict: 'ma_day' }
    );
    if (error) console.warn('[thong-bao] luu ma thiet bi that bai:', error.message);
    return ma;
  } catch (e) {
    console.warn('[thong-bao] lay ma thiet bi that bai:', e);
    return null;
  }
}
