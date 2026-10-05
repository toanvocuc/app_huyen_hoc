/**
 * Phần tính ngày tháng của bánh xe chọn ngày sinh.
 *
 * Để riêng khỏi component vì Node chạy được file này mà không cần máy ảo,
 * nhờ vậy kiem-tra/logic.ts kiểm được số ngày từng tháng và khoảng năm.
 */

/** Số ngày của một tháng, đã tính cả năm nhuận. */
export function soNgayTrongThang(thang: number, nam: number): number {
  // Ngày 0 của tháng sau chính là ngày cuối tháng này.
  return new Date(nam, thang, 0).getDate();
}

/**
 * Khoảng năm sinh bày ra trên bánh xe, cho người 18 tới 120 tuổi.
 * Phải khớp với giới hạn tuổi trong kiemNgaySinh của ho-so.ts.
 */
export function khoangNamSinh(luc: Date = new Date()): { dau: number; cuoi: number } {
  const n = luc.getFullYear();
  return { dau: n - 120, cuoi: n - 18 };
}

/** Năm hiện sẵn khi khách chưa chọn gì, đặt giữa nhóm người dùng đông nhất. */
export const NAM_MAC_DINH = 2000;

/**
 * Kéo ngày về cuối tháng khi tháng mới ngắn hơn.
 * Đang để 31 rồi chuyển sang tháng 2 thì phải thành 28 hoặc 29.
 */
export function ngayHopLe(ngay: number, thang: number, nam: number): number {
  return Math.min(ngay, soNgayTrongThang(thang, nam));
}
