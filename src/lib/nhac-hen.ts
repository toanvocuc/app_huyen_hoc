/**
 * Nhắc trước buổi hẹn.
 *
 * ─────────────────────────────────────────────────── VÌ SAO LÀ LỜI NHẮC TẠI CHỖ
 *
 * Hẹn giờ ngay trên máy bằng `scheduleNotificationAsync`, KHÔNG đi qua máy chủ.
 * Ba cái lợi, cái thứ ba mới là cái đáng kể:
 *
 *   1. Không tốn một lượt gọi máy chủ nào.
 *   2. Mất mạng vẫn kêu đúng giờ, vì hệ điều hành giữ lịch chứ không phải app.
 *   3. KHÔNG cần khoá đẩy tin. Nghĩa là nó chạy trên iPhone ngay hôm nay, trong
 *      khi đường đẩy tin từ máy chủ còn đang chờ nối xong bên iOS.
 *
 * ──────────────────────────────────────────────────────── CÁCH GIỮ CHO KHỎI LỆCH
 *
 * Không ghi sổ riêng xem đã hẹn những gì. Mỗi lần đồng bộ thì ĐỌC THẲNG danh
 * sách lịch đang treo trong hệ điều hành, so với danh sách đơn hiện có, rồi huỷ
 * phần thừa và hẹn phần thiếu.
 *
 * Giữ sổ riêng thì sổ và thực tế lệch nhau sau vài lần xoá app, đổi máy, hay
 * khách tự tắt thông báo trong cài đặt — mà lệch kiểu đó không báo lỗi gì, chỉ
 * âm thầm nhắc sai hoặc không nhắc.
 */

import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';

import { mocNhac } from '@/lib/nhac-hen-gio';
import { daCoQuyen } from '@/lib/thong-bao';
import { XEM_THU } from '@/lib/xem-thu';
import type { YeuCau } from '@/lib/yeu-cau';

/** Mọi lịch của phần này đều mang tiền tố đó, để không đụng lời nhắc lá bài. */
const DAU = 'nhac-hen-';

/**
 * iOS chỉ giữ tối đa 64 lịch đang treo cho mỗi app, và khi quá thì nó lặng lẽ
 * bỏ bớt chứ không báo. Mỗi đơn chiếm hai suất, nên chặn ở 20 đơn gần nhất và
 * chừa chỗ cho lời nhắc lá bài.
 */
const TOI_DA_DON = 20;

/** Đơn còn sống mới đáng nhắc. Đã xong hay đã huỷ thì thôi. */
const conSong = (yc: YeuCau) =>
  Boolean(yc.ngay_hen) && (yc.trang_thai === 'cho_nhan' || yc.trang_thai === 'da_nhan');

type Hen = { ma: string; khi: Date; tieuDe: string; than: string };

/**
 * Hai lời nhắc cho một đơn: tối hôm trước, và trước giờ hẹn một tiếng.
 *
 * Tối hôm trước để còn kịp sắp xếp; trước một tiếng để khỏi quên lúc đang bận.
 * Không nhắc đúng giờ hẹn — lúc đó nhắc thì đã muộn rồi.
 */
function cacHen(yc: YeuCau, tenDoiPhuong: string, laThay: boolean): Hen[] {
  if (!yc.ngay_hen) return [];
  const m = mocNhac(yc.ngay_hen, yc.khung_gio);
  if (!m) return [];
  const { homTruoc, truocMotTieng } = m;
  const ai = laThay ? tenDoiPhuong : `${tenDoiPhuong}`;
  const viec = laThay ? `Buổi tư vấn cho ${ai}` : `Buổi tư vấn với ${ai}`;

  return [
    {
      ma: `${DAU}${yc.ma}-truoc`,
      khi: homTruoc,
      tieuDe: `Mai có hẹn: ${viec.toLowerCase()}`,
      than: `${yc.khung_gio}. ${laThay ? 'Mở app xem lại câu hỏi của khách.' : 'Chuẩn bị sẵn điều bạn muốn hỏi nhé.'}`,
    },
    {
      ma: `${DAU}${yc.ma}-gan`,
      khi: truocMotTieng,
      tieuDe: `Sắp tới giờ: ${viec.toLowerCase()}`,
      than: `Khoảng một tiếng nữa, ${yc.khung_gio.toLowerCase()}.`,
    },
  ];
}

/**
 * Đồng bộ lịch nhắc với danh sách đơn hiện có.
 *
 * Nuốt mọi lỗi: hẹn không được thì khách vẫn dùng app bình thường, chỉ là không
 * được nhắc. Không có lý do gì để một lời nhắc làm vỡ màn hình đang mở.
 */
export async function donBoNhacHen(
  dsDon: YeuCau[] | null,
  tenDoiPhuong: (yc: YeuCau) => string,
  laThay = false
) {
  if (XEM_THU || !dsDon) return;
  try {
    if (!(await daCoQuyen())) return;

    const bayGio = Date.now();
    const can = new Map<string, Hen>();
    for (const yc of dsDon.filter(conSong).slice(0, TOI_DA_DON)) {
      for (const h of cacHen(yc, tenDoiPhuong(yc), laThay)) {
        // Mốc đã trôi qua thì bỏ. Hẹn vào quá khứ là thông báo nổ ngay lập tức.
        if (h.khi.getTime() > bayGio) can.set(h.ma, h);
      }
    }

    const dangTreo = (await getAllScheduledNotificationsAsync())
      .map((n) => n.identifier)
      .filter((ma) => ma.startsWith(DAU));

    // Huỷ phần thừa: đơn đã xong, đã huỷ, hoặc khách đổi ngày hẹn.
    for (const ma of dangTreo) {
      if (!can.has(ma)) await cancelScheduledNotificationAsync(ma);
    }

    // Hẹn phần thiếu. Hẹn lại cái đã có cũng vô hại vì cùng mã thì ghi đè,
    // nhưng bỏ qua cho đỡ tốn một lượt gọi xuống tầng native.
    for (const [ma, h] of can) {
      if (dangTreo.includes(ma)) continue;
      await scheduleNotificationAsync({
        identifier: ma,
        content: {
          title: h.tieuDe,
          body: h.than,
          data: { man: laThay ? '/thay' : '/lich-cua-toi' },
        },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date: h.khi },
      });
    }
  } catch (e) {
    console.warn('[nhac-hen] dong bo that bai:', e);
  }
}

/** Gỡ sạch lịch nhắc hẹn. Gọi lúc đăng xuất hoặc xoá tài khoản. */
export async function goHetNhacHen() {
  if (XEM_THU) return;
  try {
    const ds = await getAllScheduledNotificationsAsync();
    for (const n of ds) {
      if (n.identifier.startsWith(DAU)) await cancelScheduledNotificationAsync(n.identifier);
    }
  } catch (e) {
    console.warn('[nhac-hen] go lich that bai:', e);
  }
}
