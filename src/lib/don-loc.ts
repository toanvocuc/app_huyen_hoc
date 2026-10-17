/**
 * Mấy phép lọc trên danh sách đơn.
 *
 * Để riêng một file KHÔNG import gì cả, để `npm run kiem-tra` chạy được dưới
 * Node. Nhét vào `yeu-cau.ts` thì kéo theo cả Supabase, nhét vào `tim-don.ts`
 * thì kéo theo expo-router — cả hai đều không chạy ngoài máy ảo, và phần dễ sai
 * nhất ở đây lại đúng là mấy dòng lọc này.
 */

/** Đủ dùng cho mọi phép ở đây. Khai hẹp để file này không phải biết tới `YeuCau`. */
type CoMa = { ma: string };
type CoTrangThai = { trang_thai: string };

/**
 * Tách đơn cần ghim ra khỏi danh sách.
 *
 * Phải tách chứ không chỉ đánh dấu: ghim lên đầu mà vẫn để nó nằm nguyên trong
 * danh sách thì cùng một đơn hiện hai lần, nhìn rất giống dữ liệu hỏng.
 *
 * `ghim` là null khi không có mã cần tìm, HOẶC khi có mã mà không còn đơn nào
 * mang mã đó — chỗ gọi phân biệt hai ca ấy bằng chính cái mã, và nói cho người
 * dùng biết ở ca thứ hai.
 */
export function tachDonGhim<T extends CoMa>(
  dayDu: T[],
  dangHien: T[],
  ma: string | null
): { ghim: T | null; conLai: T[] } {
  if (!ma) return { ghim: null, conLai: dangHien };
  // Tìm trong danh sách ĐẦY ĐỦ, không trong danh sách đang hiện: thầy đang gõ
  // tìm một cái tên rồi bấm thông báo về đơn của người khác thì đơn ấy không
  // khớp ô tìm. Tìm theo danh sách đã lọc là không thấy gì, mà đó đúng là lúc
  // cần ghim nhất.
  const ghim = dayDu.find((x) => x.ma === ma) ?? null;
  return { ghim, conLai: ghim ? dangHien.filter((x) => x.ma !== ma) : dangHien };
}

/**
 * Đơn nào thầy dọn được: việc đã khép lại.
 *
 * Đơn đang chờ nhận hoặc đã nhận mà chưa xong thì KHÔNG — dọn mất một buổi hẹn
 * mình đã nhận là hỏng cả hai đầu, mà khách thì không thấy gì khác lạ.
 */
export const TRANG_THAI_DON_DUOC = ['da_xong', 'da_huy'];

export function donDuocDon<T extends CoTrangThai>(ds: T[]): T[] {
  return ds.filter((y) => TRANG_THAI_DON_DUOC.includes(y.trang_thai));
}

/** Mã của mọi đơn dọn được, để gửi một lượt xuống máy chủ. */
export function maDonDuocDon<T extends CoMa & CoTrangThai>(ds: T[]): string[] {
  return donDuocDon(ds).map((y) => y.ma);
}
