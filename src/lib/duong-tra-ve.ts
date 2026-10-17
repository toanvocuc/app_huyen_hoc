/**
 * Bóc địa chỉ trình duyệt trả về sau một vòng OAuth. CỐ Ý KHÔNG NHẬP GÌ.
 *
 * Tách khỏi `dang-nhap.ts` vì file kia nhập expo-linking và expo-web-browser,
 * hai gói không chạy được ngoài máy ảo — để chung thì phần dễ sai nhất lại là
 * phần không thử được. Ở đây thuần chuỗi, `npm run kiem-tra` gọi thẳng.
 *
 * ──────────────────────────────────────────── VÌ SAO PHẢI ĐỌC CẢ PHẦN LỖI
 *
 * Supabase không phải lúc nào cũng báo hỏng bằng cách ném lỗi qua SDK. Khi vòng
 * OAuth hỏng ở phía máy chủ, nó báo bằng cách NHÉT LỖI VÀO CHÍNH ĐỊA CHỈ TRẢ VỀ:
 *
 *   omora://dang-nhap-xong?error=server_error
 *     &error_code=identity_already_exists
 *     &error_description=Identity+is+already+linked+to+another+user
 *
 * Code cũ chỉ hỏi ô `code`. Không thấy thì kêu "Trình duyệt quay về nhưng thiếu
 * mã đăng nhập" — một câu không nói lên điều gì, trong khi địa chỉ đang cầm sẵn
 * lý do thật. Ca hay gặp nhất chính là ca trên, mà app lại có sẵn một hộp thoại
 * riêng cho nó; hộp thoại đó không bao giờ chạy tới.
 */

/**
 * Gom tham số từ CẢ phần sau dấu hỏi lẫn phần sau dấu thăng.
 *
 * Nhà cung cấp này trả sau dấu hỏi, nhà kia trả sau dấu thăng, có lúc cả hai.
 * Cách cũ đổi dấu thăng thành dấu hỏi rồi cắt từ dấu hỏi ĐẦU TIÊN — nên địa chỉ
 * nào có sẵn dấu hỏi là phần sau dấu thăng mất sạch.
 *
 * Phần trước thắng khi trùng khoá, vì đó là phần chuẩn của OAuth.
 */
export function thamSo(duong: string): URLSearchParams {
  const ra = new URLSearchParams();
  const nhet = (chuoi: string) => {
    if (!chuoi) return;
    for (const [k, v] of new URLSearchParams(chuoi)) if (!ra.has(k)) ra.set(k, v);
  };
  const thang = duong.indexOf('#');
  const hoi = duong.indexOf('?');
  if (hoi >= 0) nhet(duong.slice(hoi + 1, thang > hoi ? thang : duong.length));
  if (thang >= 0) nhet(duong.slice(thang + 1, hoi > thang ? hoi : duong.length));
  return ra;
}

/** Mã dùng một lần, nếu vòng OAuth chạy trót lọt. */
export function layMa(duong: string): string | null {
  return thamSo(duong).get('code');
}

/** Lỗi nằm trong địa chỉ trả về. Null nghĩa là địa chỉ không mang lỗi nào. */
export function docLoi(duong: string): { ma: string; ta: string } | null {
  const p = thamSo(duong);
  // `error_code` nói đúng chuyện gì; `error` chỉ nói loại chung chung.
  const ma = p.get('error_code') ?? p.get('error') ?? '';
  const ta = p.get('error_description') ?? p.get('message') ?? '';
  if (!ma && !ta) return null;
  return { ma, ta };
}

/** Danh tính vừa chọn đã thuộc về một hồ sơ khác. */
export function laTrungDanhTinh(ma: string, ta: string): boolean {
  return /already|exists|duplicate|identity_already/i.test(`${ma} ${ta}`);
}

/** Khách tự bấm từ chối ở trang của nhà cung cấp. */
export function laKhachTuChoi(ma: string, ta: string): boolean {
  return /access_denied|user_cancel|consent_required/i.test(`${ma} ${ta}`);
}
