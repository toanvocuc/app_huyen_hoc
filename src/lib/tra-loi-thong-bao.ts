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

export { useLastNotificationResponse as useTraLoiThongBao } from 'expo-notifications/build/useLastNotificationResponse';
