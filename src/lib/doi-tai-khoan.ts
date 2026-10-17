/**
 * Máy này vừa đổi sang người khác thì mọi thứ nhớ tạm của người cũ phải quên đi.
 *
 * ───────────────────────────────────────────────────────── CHUYỆN ĐÃ HỎNG THẬT
 *
 * Khách đăng nhập Google bằng tài khoản A, rồi đăng xuất và đăng nhập bằng tài
 * khoản B — app vẫn hiện tên, ngày sinh và cung của A. Đổi tên ở B xong quay
 * lại A thì A cũng mang tên vừa đổi. Nhìn y như hai tài khoản Google bị gộp làm
 * một, nhưng dưới máy chủ hai hồ sơ vẫn tách bạch và đúng nguyên.
 *
 * Lỗi nằm ở mấy ô nhớ đặt ở CẤP MODULE:
 *
 *   • `ho-so.ts`    — bản hồ sơ dùng chung, cờ "đã đọc", cờ "đã có hồ sơ"
 *   • `ban-nhap.ts` — bản nháp năm bước nhập hồ sơ
 *   • `phien-rut.ts`— lần rút bài vừa xong
 *
 * Mấy ô đó sống theo MODULE, không theo màn hình và cũng không theo phiên đăng
 * nhập. Đăng xuất chỉ xoá thẻ đăng nhập; mọi thứ trên vẫn nằm nguyên, nên người
 * kế tiếp đọc trúng đồ của người trước. Tắt hẳn app rồi mở lại thì hết — và
 * chính điều đó làm nó khó bắt, vì thử kiểu nào có nạp lại trang cũng thấy đúng.
 *
 * Hậu quả nặng nhất không phải hiện sai tên. Bản nháp năm bước còn giữ tên và
 * ngày sinh của người cũ, nên người mới mở phần nhập hồ sơ ra là thấy điền sẵn,
 * bấm Tiếp vài cái là GHI ĐÈ danh tính người cũ vào tài khoản mình.
 *
 * ───────────────────────────────────────────────────────────────── CÁCH CHỮA
 *
 * Không đi gọi hàm dọn ở từng chỗ đăng xuất. Làm vậy là mỗi lần thêm một đường
 * đăng nhập mới lại phải nhớ gọi thêm một lần, mà quên một chỗ thì lỗi này quay
 * lại y nguyên — chính kiểu thiết kế đã sinh ra nó.
 *
 * Thay vào đó nghe thẳng Supabase, so MÃ NGƯỜI DÙNG. Mã đổi thì mọi chỗ đã ghi
 * danh đều được gọi dọn, bất kể đổi qua đường nào: đăng xuất, đăng nhập mới,
 * gắn tài khoản, hay phiên hết hạn. Làm mới thẻ thì mã không đổi nên không ai
 * bị gọi oan.
 */

import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

/** `ma` là người MỚI, null khi vừa đăng xuất hẳn. */
type Quen = (ma: string | null) => void;

const nguoiQuen = new Set<Quen>();

/**
 * `undefined` nghĩa là chưa biết ai đang dùng máy.
 *
 * Phải tách khỏi `null` (không có ai). Lượt gọi đầu tiên của Supabase là để báo
 * phiên đang có sẵn lúc app mở, không phải một lần đổi người — coi nó là đổi
 * người thì mỗi lần mở app đều dọn sạch một lần vô cớ.
 */
let maDangDung: string | null | undefined;
let daNghe = false;

function ngheMotLan() {
  if (daNghe || XEM_THU) return;
  daNghe = true;
  supabase.auth.onAuthStateChange((_, phien) => {
    const ma = phien?.user?.id ?? null;
    if (maDangDung === undefined) {
      maDangDung = ma;
      return;
    }
    if (ma === maDangDung) return;
    maDangDung = ma;
    nguoiQuen.forEach((f) => {
      try {
        f(ma);
      } catch (e) {
        // Một chỗ dọn hỏng thì mấy chỗ còn lại vẫn phải được dọn. Nuốt lỗi ở
        // đây chứ không để nó chặn cả vòng lặp.
        console.warn('[doi-tai-khoan]', e);
      }
    });
  });
}

/**
 * Ghi danh một việc cần làm khi máy đổi sang người khác.
 *
 * Gọi ngay lúc module được nạp, không gọi trong hiệu ứng của màn hình: mấy ô
 * nhớ cần dọn cũng sống ở cấp module, nên việc dọn phải sống cùng tuổi với
 * chúng. Trả về hàm huỷ ghi danh, cho chỗ nào gọi từ trong màn hình.
 */
export function khiDoiTaiKhoan(f: Quen): () => void {
  ngheMotLan();
  nguoiQuen.add(f);
  return () => {
    nguoiQuen.delete(f);
  };
}
