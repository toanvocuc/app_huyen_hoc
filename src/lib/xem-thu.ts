/**
 * Chế độ xem thử: bật EXPO_PUBLIC_XEM_THU=1 trong .env thì app chạy hoàn toàn bằng
 * nội dung đóng sẵn, không cần máy chủ, không cần đăng nhập.
 *
 * Dùng để duyệt giao diện và chụp ảnh nộp chợ. KHÔNG bật ở bản phát hành:
 * hồ sơ là giả và không có gì được lưu lại.
 */

import type { HoSo } from '@/lib/ho-so';

export const XEM_THU = process.env.EXPO_PUBLIC_XEM_THU === '1';

/**
 * Xem thử CHẾ ĐỘ THẦY.
 *
 * Cờ riêng chứ không gộp vào XEM_THU: gộp thì mọi bản xem thử đều thành chế độ
 * thầy và không ai xem được phần của khách nữa. Dùng để dựng giao diện và chụp
 * ảnh màn làm việc của thầy mà không cần tài khoản thật.
 *
 *   EXPO_PUBLIC_XEM_THU=1 EXPO_PUBLIC_XEM_THU_THAY=1 npx expo start --web
 */
export const XEM_THU_THAY = XEM_THU && process.env.EXPO_PUBLIC_XEM_THU_THAY === '1';

export const HO_SO_MAU: HoSo = {
  nguoi_dung: 'xem-thu',
  ho_ten: 'Nguyễn Thị Ánh Đào',
  ngay_sinh: '1995-09-16',
  gio_sinh: '07:30',
  noi_sinh: 'Hà Nội',
  gioi_tinh: 'nu',
  gio_nhac: '07:00',
  nhac_la_bai: true,
  nhac_tin_tuc: false,
};
