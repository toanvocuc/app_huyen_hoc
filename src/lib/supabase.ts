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
 * Dấu ghi lại rằng máy này TẮNG có tài khoản thật (Google hoặc Apple).
 *
 * Cần nó vì `getSession()` trả null trong HAI trường hợp khác hẳn nhau, mà nhìn
 * vào kết quả thì giống hệt:
 *
 *   1. Máy này chưa từng đăng nhập — tạo hồ sơ ẩn danh là đúng.
 *   2. Từng đăng nhập, nhưng thẻ làm mới đã chết — hết hạn, bị thu hồi, hoặc
 *      khách đăng xuất từ một máy khác.
 *
 * Trước đây cả hai đều dẫn tới `signInAnonymously()`. Nghĩa là một khách đã
 * đăng nhập Google, chỉ cần thẻ chết là lần lưu hồ sơ kế tiếp đẻ ra MỘT DANH TÍNH
 * MỚI HOÀN TOÀN, rồi ghi hồ sơ vào đó. Tài khoản thật cùng mọi đơn đặt lịch, lịch
 * sử và đánh giá nằm lại phía sau, không một dòng báo nào.
 */
const KHOA_THAT = 'omora-tai-khoan-that';

/** Phiên đã chết trên một máy từng đăng nhập thật. */
export class PhienHetHan extends Error {
  constructor() {
    super('Phiên đăng nhập đã hết hạn');
    this.name = 'PhienHetHan';
  }
}

export async function ghiDauTaiKhoanThat() {
  try {
    await AsyncStorage.setItem(KHOA_THAT, '1');
  } catch {
    // Không ghi được thì thôi. Mất dấu chỉ làm mất lớp bảo vệ, không làm hỏng gì.
  }
}

export async function xoaDauTaiKhoanThat() {
  try {
    await AsyncStorage.removeItem(KHOA_THAT);
  } catch {}
}

async function daTungCoTaiKhoanThat(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KHOA_THAT)) === '1';
  } catch {
    return false;
  }
}

/**
 * Tạo hồ sơ ẩn danh. Khách không phải bấm gì.
 * Phiên đăng nhập lưu lại trong máy, nên lần sau mở vẫn là người đó.
 *
 * `coY` là true khi chính khách bấm "Dùng ngay, không cần tài khoản". Lúc đó họ
 * biết mình đang chọn gì nên cứ tạo, và xóa luôn dấu cũ.
 *
 * Gọi ngầm (ví dụ từ `luuHoSo`) thì KHÔNG được tự đẻ ra danh tính mới trên một
 * máy từng đăng nhập thật — thà hỏng rõ còn hơn mất dữ liệu lặng lẽ.
 */
export async function dangNhapAnDanh(coY = false) {
  if (XEM_THU) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;

  if (coY) await xoaDauTaiKhoanThat();
  else if (await daTungCoTaiKhoanThat()) throw new PhienHetHan();

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

  // Ghi dấu mỗi lần nhìn thấy một tài khoản thật. Lớp đệm cho trường hợp dấu
  // chưa kịp ghi lúc đăng nhập, ví dụ bản cũ cài từ trước khi có phần này.
  if (!anDanh) void ghiDauTaiKhoanThat();

  return {
    anDanh,
    email: u.email ?? null,
    nha: danhTinh[0]?.provider ?? (u.app_metadata?.provider as string | undefined) ?? null,
  };
}
