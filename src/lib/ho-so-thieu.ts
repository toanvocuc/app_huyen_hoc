/**
 * Hồ sơ còn thiếu gì để chuyên gia xem được cho khách.
 *
 * App KHÔNG chặn ai vì thiếu hồ sơ — khách vẫn gửi đơn được. Chỗ này chỉ để nói
 * trước cho họ biết mình đang thiếu gì, và rằng chuyên gia có thể phải huỷ đơn
 * vì không đủ thông tin. Nói trước thì khách tự quyết; chặn lại thì họ đi.
 *
 * File này KHÔNG import gì, để `npm run kiem-tra` chạy được dưới Node.
 */

/** Chỉ cần mấy ô này, nên không buộc chỗ gọi phải đưa cả `HoSo`. */
export type HoSoRut = {
  ho_ten?: string | null;
  ngay_sinh?: string | null;
  gio_sinh?: string | null;
  noi_sinh?: string | null;
};

function trong(x: string | null | undefined): boolean {
  return !x || x.trim().length === 0;
}

/**
 * Tên mấy ô còn trống, xếp theo mức quan trọng với chuyên gia.
 *
 * Họ tên và ngày sinh đứng trước vì thiếu hai thứ đó thì không xem được gì cả.
 * Giờ sinh và nơi sinh là thứ luồng nhập hồ sơ cho phép bỏ qua, nhưng lá số Tử
 * Vi và bản đồ sao đều cần — nên vẫn nhắc, chỉ là nhắc sau.
 */
export function thieuHoSo(h: HoSoRut | null | undefined): string[] {
  const ra: string[] = [];
  if (!h || trong(h.ho_ten)) ra.push('họ tên');
  if (!h || trong(h.ngay_sinh)) ra.push('ngày sinh');
  if (!h || trong(h.gio_sinh)) ra.push('giờ sinh');
  if (!h || trong(h.noi_sinh)) ra.push('nơi sinh');
  return ra;
}

/**
 * Ghép thành câu đọc được: 'họ tên, ngày sinh và giờ sinh'.
 *
 * Dấu phẩy giữa chừng, chữ 'và' trước cái cuối. Liệt kê toàn dấu phẩy đọc lên
 * giống máy đọc, mà câu này nằm trong hộp thoại hỏi khách có chắc không — chỗ
 * cần nghe như người nói.
 */
export function cauThieu(ds: string[]): string {
  if (ds.length === 0) return '';
  if (ds.length === 1) return ds[0];
  return `${ds.slice(0, -1).join(', ')} và ${ds[ds.length - 1]}`;
}
