/**
 * Nối tới Supabase.
 *
 * Khoá dùng ở đây là khoá công khai, lộ ra ngoài cũng được — NHƯNG chỉ an toàn
 * khi mọi bảng đều đã bật khoá dòng dữ liệu. Bảng chưa bật là bảng ai cầm khoá này
 * cũng đọc được toàn bộ.
 *
 * Khoá quản trị (service role) KHÔNG BAO GIỜ nằm trong file này hay bất cứ file nào
 * của app. Nó chỉ sống trong Edge Function. Gặp lỗi không có quyền thì sửa luật khoá
 * dòng, đừng đổi sang khoá quản trị cho hết báo lỗi.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { XEM_THU } from '@/lib/xem-thu';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!XEM_THU && (!url || !anonKey)) {
  throw new Error(
    'Thiếu EXPO_PUBLIC_SUPABASE_URL hoặc EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Chép .env.example thành .env rồi điền vào.'
  );
}

export const supabase = createClient(url ?? 'https://xem-thu.invalid', anonKey ?? 'xem-thu', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Tắt vì app di động không có địa chỉ trang web để đọc mã đăng nhập.
    detectSessionInUrl: false,
    // Luồng PKCE: trình duyệt trả về một mã dùng một lần, app đổi mã đó lấy
    // phiên. Luồng kia nhét thẳng thẻ đăng nhập vào địa chỉ, mà địa chỉ thì
    // nằm lại trong lịch sử trình duyệt và trong log hệ thống.
    flowType: 'pkce',
  },
});

/**
 * Tạo hồ sơ ẩn danh ở lần mở app đầu tiên. Khách không phải bấm gì.
 * Phiên đăng nhập lưu lại trong máy, nên lần sau mở vẫn là người đó.
 */
export async function dangNhapAnDanh() {
  if (XEM_THU) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;

  const { data: moi, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return moi.user;
}

/** Mã người dùng hiện tại. Ở chế độ xem thử thì trả mã cố định để nội dung không đổi. */
export async function maNguoiDung(): Promise<string | null> {
  if (XEM_THU) return 'xem-thu';
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export type TinTaiKhoan = {
  /** Supabase đánh dấu sẵn bằng cờ riêng, đừng tự suy ra từ chuyện có email
   *  hay không — khách đăng nhập Apple có quyền giấu email thật. */
  anDanh: boolean;
  email: string | null;
  /** 'google' | 'apple' | 'anonymous'. Dùng để hiện đúng tên nhà cung cấp. */
  nha: string | null;
};

/**
 * Khách hiện tại là ai. Trả null khi chưa có phiên nào.
 *
 * KHÔNG chỉ dựa vào cờ `is_anonymous`. Sau khi gắn tài khoản Google vào hồ sơ
 * ẩn danh, cờ đó không chắc đã đổi ngay trong thẻ đăng nhập đang cầm — tài liệu
 * Supabase không nói rõ, và thực tế đã gặp cảnh khách gắn xong mà màn Cá nhân
 * vẫn hiện lời mời đăng nhập.
 *
 * Nên xét cả ba dấu hiệu, có một là đủ coi như tài khoản thật: cờ đã tắt, có
 * email, hoặc có một danh tính nào khác 'anonymous'. Dấu hiệu nào cũng chỉ xuất
 * hiện sau khi gắn thành công, nên không có đường báo nhầm.
 */
export async function tinTaiKhoan(): Promise<TinTaiKhoan | null> {
  if (XEM_THU) return { anDanh: true, email: null, nha: null };
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return null;

  const danhTinh = (u.identities ?? []).filter((d) => d.provider !== 'anonymous');
  const anDanh = (u.is_anonymous ?? false) && !u.email && danhTinh.length === 0;

  return {
    anDanh,
    email: u.email ?? null,
    nha: danhTinh[0]?.provider ?? (u.app_metadata?.provider as string | undefined) ?? null,
  };
}
