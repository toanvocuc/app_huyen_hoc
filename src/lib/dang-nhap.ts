/**
 * Đăng nhập bằng Google và Apple, và gắn tài khoản thật vào hồ sơ ẩn danh.
 *
 * Đi bằng luồng OAuth qua trình duyệt chứ không dùng thư viện native của Google
 * hay Apple. Lý do: app đã có sẵn `expo-web-browser`, `expo-linking` và địa chỉ
 * `omora://`, nên không phải thêm thư viện nào. Thêm thư viện native là đổi vân
 * tay, mà đổi vân tay thì bản đang sống trên chợ mất đường nhận cập nhật.
 *
 * Luồng chạy:
 *   1. Hỏi Supabase lấy địa chỉ trang đăng nhập của nhà cung cấp
 *   2. Mở trang đó trong trình duyệt hệ thống
 *   3. Khách đăng nhập xong, trình duyệt trả về `omora://dang-nhap-xong?code=...`
 *   4. Đổi mã đó lấy phiên đăng nhập
 *
 * Mã chỉ dùng được một lần, và đổi mã cần thêm một chuỗi bí mật chỉ app giữ
 * (PKCE). Nhờ vậy ai chặn được địa chỉ trả về cũng không vào được tài khoản.
 */

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

export type NhaCungCap = 'google' | 'apple';

const TEN: Record<NhaCungCap, string> = { google: 'Google', apple: 'Apple' };

/**
 * Địa chỉ trình duyệt quay về sau khi đăng nhập xong.
 *
 * Chuỗi này khai ở Supabase: Authentication → URL Configuration → Redirect URLs.
 *
 * ĐỪNG khai nó bên Google Cloud. Google không bao giờ gọi thẳng vào app: nó trả
 * về cho Supabase trước, rồi Supabase mới đẩy tiếp về đây. Nên bên Google phải
 * khai địa chỉ của Supabase:
 *
 *     https://dgoyowwhblqmdsnpxwgo.supabase.co/auth/v1/callback
 *
 * Khai nhầm `omora://...` vào ô của Google là Google từ chối ngay từ đầu, vì nó
 * chỉ nhận địa chỉ bắt đầu bằng https.
 */
export function duongQuayVe(): string {
  return Linking.createURL('dang-nhap-xong');
}

/** Bóc mã dùng một lần ra khỏi địa chỉ trả về. */
function layMa(duong: string): string | null {
  // Một số nhà cung cấp trả về sau dấu thăng thay vì dấu hỏi.
  const q = duong.includes('#') ? duong.replace('#', '?') : duong;
  const dau = q.indexOf('?');
  if (dau < 0) return null;
  return new URLSearchParams(q.slice(dau + 1)).get('code');
}

/** Khách tự bấm huỷ. Tách riêng để màn hình không hiện chữ đỏ doạ người ta. */
export class KhachHuy extends Error {
  constructor() {
    super('Đã huỷ đăng nhập');
    this.name = 'KhachHuy';
  }
}

/**
 * Chạy một vòng OAuth.
 *
 * `gan` quyết định cách gọi:
 *   - false: đăng nhập mới, tạo tài khoản nếu chưa có
 *   - true: GẮN nhà cung cấp vào tài khoản đang đăng nhập
 *
 * Phải tách hai đường này. Khách đang dùng ẩn danh mà gọi đăng nhập mới thì
 * Supabase tạo một tài khoản khác, còn hồ sơ và toàn bộ lịch sử rút bài nằm lại
 * ở tài khoản ẩn danh cũ — khách mở lên thấy trắng trơn và tưởng mất hết. Gắn
 * thì giữ nguyên mã người dùng, nên không có gì phải chép qua.
 */
async function chayOAuth(nha: NhaCungCap, gan: boolean): Promise<void> {
  const ve = duongQuayVe();
  const tuyChon = {
    redirectTo: ve,
    skipBrowserRedirect: true,
    // Bắt Google hiện bảng chọn tài khoản.
    //
    // Mặc định nó im lặng dùng luôn tài khoản đang đăng nhập sẵn trên máy, nên
    // khách muốn đổi sang tài khoản khác thì không có đường nào: bấm bao nhiêu
    // lần cũng ra đúng tài khoản cũ. Apple thì luôn tự hiện bảng chọn nên không
    // cần, và nhét thêm tham số lạ vào có khi nó từ chối.
    ...(nha === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
  };

  const { data, error } = gan
    ? await supabase.auth.linkIdentity({ provider: nha, options: tuyChon })
    : await supabase.auth.signInWithOAuth({ provider: nha, options: tuyChon });
  if (error) throw error;
  if (!data?.url) throw new Error(`Chưa bật đăng nhập ${TEN[nha]} ở phía máy chủ.`);

  const kq = await WebBrowser.openAuthSessionAsync(data.url, ve);
  if (kq.type !== 'success') throw new KhachHuy();

  const ma = layMa(kq.url);
  if (!ma) throw new Error('Trình duyệt quay về nhưng thiếu mã đăng nhập.');

  const { error: loiDoi } = await supabase.auth.exchangeCodeForSession(ma);
  if (loiDoi) throw loiDoi;
}

/** Đăng nhập mới. Dùng ở màn mở đầu, lúc khách chưa chọn gì. */
export const dangNhapGoogle = () => chayOAuth('google', false);
export const dangNhapApple = () => chayOAuth('apple', false);

/**
 * Gắn tài khoản thật vào hồ sơ ẩn danh đang dùng.
 *
 * Dùng ở màn Cá nhân. Giữ nguyên mã người dùng nên hồ sơ, lịch sử rút bài và số
 * lượt còn lại trong ngày đều không suy suyển.
 *
 * Cần bật "Manual linking" trong Supabase: Authentication → Providers → phần
 * Advanced. Chưa bật thì lời gọi này báo lỗi, chứ không âm thầm tạo tài khoản
 * mới — thà hỏng rõ còn hơn mất dữ liệu lặng lẽ.
 */
export const ganGoogle = () => chayOAuth('google', true);
export const ganApple = () => chayOAuth('apple', true);

/** Đổi lỗi máy móc thành câu người đọc hiểu được. */
export function loiDeHieu(e: unknown): string {
  if (e instanceof KhachHuy) return e.message;
  const tho = e instanceof Error ? e.message : String(e);
  if (/already|exists|duplicate|identity_already/i.test(tho)) {
    // Hay gặp nhất: khách từng bấm đăng nhập ở màn mở đầu bằng chính tài khoản
    // này, nên nó đã thành một hồ sơ riêng. Supabase không cho một danh tính
    // thuộc về hai hồ sơ, nên phải chọn giữ cái nào.
    return (
      'Tài khoản này đã dùng cho một hồ sơ khác rồi, nên không gắn thêm được. ' +
      'Muốn dùng nó thì đăng xuất rồi đăng nhập thẳng bằng nó — nhưng hồ sơ đang ' +
      'mở ở máy này sẽ không theo sang. Hoặc chọn một tài khoản khác.'
    );
  }
  if (/not enabled|unsupported provider/i.test(tho)) {
    return 'Cách đăng nhập này chưa được bật. Báo lại giúp chúng tôi.';
  }
  if (/network|fetch|timeout/i.test(tho)) {
    return 'Mạng đang chập chờn. Thử lại giúp tôi.';
  }
  return tho;
}

/**
 * Đăng xuất, để đổi sang tài khoản khác.
 *
 * KHÔNG mất gì cả. Hồ sơ và lịch sử rút bài nằm trên máy chủ, gắn với tài khoản
 * Google hay Apple đó; đăng nhập lại là thấy y nguyên. Chữ trên nút phải nói rõ
 * điều này, không thì khách sợ không dám bấm.
 *
 * Màn gốc nghe onAuthStateChange nên đăng xuất xong nó tự đưa về màn chọn, ở
 * đây không phải điều hướng gì.
 */
export async function dangXuat(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
