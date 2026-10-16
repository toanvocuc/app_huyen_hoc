/**
 * Lần gần nhất khách bấm vào một thông báo.
 *
 * Tách ra làm hai file theo nền tảng vì bản web KHÔNG có hàm này — gọi thẳng là
 * `UnavailabilityError` ném ra giữa lúc dựng màn gốc, và sập cả app:
 *
 *   The method or property ExpoNotifications.getLastNotificationResponse is not
 *   available on web
 *
 * Metro tự chọn file `.web.ts` khi đóng gói cho trình duyệt, nên không cần một
 * dòng `if (Platform.OS === ...)` nào — mà cũng không đặt được, vì gọi hook có
 * điều kiện là sai luật của React.
 *
 * Cùng khuôn với `hooks/use-color-scheme.web.ts` đã có trong dự án.
 */

import { addNotificationReceivedListener } from 'expo-notifications/build/NotificationsEmitter';

export { useLastNotificationResponse as useTraLoiThongBao } from 'expo-notifications/build/useLastNotificationResponse';

/**
 * Xoá dấu vết lần bấm vừa xử lý xong.
 *
 * PHẢI gọi sau khi đã chuyển màn theo thông báo. `getLastNotificationResponse`
 * là bộ nhớ dai của tầng native: nó giữ lần bấm gần nhất cho tới khi có người
 * xoá, không tự hết hạn và không phân biệt lần mở app này với lần trước.
 *
 * Thiếu dòng xoá thì sinh ra con bug này: khách bấm một thông báo, app mở đúng
 * màn — đúng ý. Nhưng từ đó về sau, MỖI LẦN mở app là màn gốc lại đọc đúng lần
 * bấm cũ đó và nhảy vào lại đúng màn ấy. Càng lâu càng vô lý, vì thông báo có
 * thể đã cũ cả tuần và khách cũng đã xoá nó khỏi chuông từ lâu.
 */
export { clearLastNotificationResponse as xoaTraLoiThongBao } from 'expo-notifications/build/NotificationsEmitter';

/**
 * Nghe thông báo tới trong lúc app đang mở.
 *
 * Dùng để chuông tô ngay chấm đỏ. Thiếu nó thì máy rung, băng thông báo hiện
 * ra ngay trên đỉnh, mà cái chuông ngay dưới đó vẫn trống trơn cho tới khi có
 * người bấm vào — đúng cái cảnh mà `lib/hop-thong-bao.ts` nói là không được
 * để xảy ra.
 *
 * Nhập lẻ đúng file build chứ không `import * as Notifications`: nhập cả gói là
 * kéo theo một module chạy phụ ném lỗi trên Android trong Expo Go. Xem phần
 * giải thích dài ở đầu `lib/thong-bao.ts`.
 *
 * Trả hàm dọn, gọi lúc rời màn.
 */
export function ngheThongBaoToi(khiToi: () => void): () => void {
  const o = addNotificationReceivedListener(khiToi);
  return () => o.remove();
}
