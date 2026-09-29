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

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Thiếu EXPO_PUBLIC_SUPABASE_URL hoặc EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Chép .env.example thành .env rồi điền vào.'
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Tắt vì app di động không có địa chỉ trang web để đọc mã đăng nhập.
    detectSessionInUrl: false,
  },
});

/**
 * Tạo hồ sơ ẩn danh ở lần mở app đầu tiên. Khách không phải bấm gì.
 * Phiên đăng nhập lưu lại trong máy, nên lần sau mở vẫn là người đó.
 */
export async function dangNhapAnDanh() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;

  const { data: moi, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return moi.user;
}
