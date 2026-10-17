/**
 * Đăng nhập với tư cách thầy, và nhận biết mình có phải thầy không.
 *
 * Khác hẳn đường đăng nhập của khách. Khách vào bằng Google, Apple hoặc ẩn danh
 * — ai cũng tự tạo được. Thầy thì tài khoản do công ty cấp, bằng email và mật
 * khẩu, nên không có nút "đăng ký" ở đây và sẽ không bao giờ có.
 *
 * Việc nối một tài khoản với một hồ sơ thầy nằm trong bảng
 * `lien_he_chuyen_gia`, bảng đã khoá kín. Cố ý không để trong bảng `chuyen_gia`
 * vì bảng đó ai cũng đọc được — app cần nó để hiện danh sách thầy cho cả khách
 * chưa đăng nhập.
 */

import { useCallback, useEffect, useState } from 'react';

import { ghiDauTaiKhoanThat, supabase, xoaDauTaiKhoanThat } from '@/lib/supabase';
import { XEM_THU, XEM_THU_THAY } from '@/lib/xem-thu';

export type TinThay = { ma: string; ten: string };

/**
 * Hồ sơ thầy mà tài khoản đang đăng nhập làm chủ. Null nếu không phải thầy.
 *
 * Bảng `lien_he_chuyen_gia` khoá kín, chỉ có đúng một luật cho đọc: dòng nào
 * `tai_khoan` khớp người đang gọi. Nên khách thường gọi hàm này luôn nhận về
 * mảng rỗng — đó là ý muốn, không phải lỗi.
 *
 * Luật đó ở migration 0017. Thiếu nó thì thầy đăng nhập đúng mật khẩu mà app
 * vẫn báo "chưa được cấp quyền chuyên gia" — đã dính một lần rồi.
 */
export async function hoSoThayCuaToi(): Promise<TinThay | null> {
  if (XEM_THU_THAY) return { ma: 'luna-chiem-tinh', ten: 'Luna Chiêm Tinh' };
  if (XEM_THU) return null;

  const { data, error } = await supabase
    .from('lien_he_chuyen_gia')
    .select('chuyen_gia, chuyen_gia_ho_so:chuyen_gia(ten)')
    .maybeSingle();

  if (error || !data) return null;
  const ten = (data as { chuyen_gia_ho_so?: { ten?: string } }).chuyen_gia_ho_so?.ten;
  return { ma: data.chuyen_gia as string, ten: ten ?? 'Chuyên gia' };
}

/** Lỗi đã dịch sang tiếng người, để màn hình khỏi bày chữ máy ra cho khách. */
export class LoiDangNhapThay extends Error {}

/**
 * Đăng nhập bằng email và mật khẩu, rồi kiểm xem tài khoản đó có phải thầy không.
 *
 * Đúng mật khẩu nhưng không phải thầy thì ĐĂNG XUẤT NGAY. Để nguyên phiên đó là
 * khách vô tình vào được bằng tài khoản thường, rồi app rơi vào trạng thái nửa
 * vời: có phiên, không có hồ sơ khách, cũng không có hồ sơ thầy.
 */
export async function dangNhapThay(email: string, matKhau: string): Promise<TinThay> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: matKhau,
  });

  if (error) {
    // Cố ý KHÔNG nói rõ sai email hay sai mật khẩu. Nói rõ là giúp người dò tài
    // khoản biết địa chỉ nào có thật.
    throw new LoiDangNhapThay('Email hoặc mật khẩu chưa đúng.');
  }

  const thay = await hoSoThayCuaToi();
  if (!thay) {
    await supabase.auth.signOut();
    // Đăng nhập đúng mật khẩu nhưng không phải thầy thì coi như chưa từng vào:
    // để dấu lại thì lần sau bấm "Dùng ngay" bị báo phiên hết hạn oan.
    await xoaDauTaiKhoanThat();
    throw new LoiDangNhapThay('Tài khoản này chưa được cấp quyền chuyên gia.');
  }

  // Tài khoản thầy cũng là tài khoản thật. Ghi dấu để thẻ chết thì app báo phiên
  // hết hạn chứ không lặng lẽ đẻ ra một danh tính ẩn danh mới.
  await ghiDauTaiKhoanThat();
  return thay;
}

/**
 * Tài khoản đang đăng nhập có phải thầy không.
 *
 * Trả `null` khi chưa biết — màn hình phải chờ, đừng coi null là "không phải".
 * Nhầm chỗ này thì thầy vừa mở app đã bị đá vào luồng nhập hồ sơ của khách.
 */
export function useLaThay() {
  const [thay, datThay] = useState<TinThay | null>(null);
  const [xong, datXong] = useState(false);

  const hoiLai = useCallback(() => {
    let huy = false;
    hoSoThayCuaToi()
      .then((t) => {
        if (huy) return;
        datThay(t);
      })
      .catch(() => {})
      .finally(() => {
        if (!huy) datXong(true);
      });
    return () => {
      huy = true;
    };
  }, []);

  useEffect(hoiLai, [hoiLai]);
  return { thay, xong };
}
