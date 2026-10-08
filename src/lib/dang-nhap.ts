/**
 * Đăng nhập bằng Google và Apple.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CHƯA CHẠY ĐƯỢC. Hai hàm dưới đây mới là chỗ trống có sẵn hình hài.
 *
 * Phần giao diện đã xong, nhưng muốn bấm ra việc thì còn ba thứ KHÔNG sửa bằng
 * JavaScript được, nên phải đóng gói lại app:
 *
 *  1. Bật nhà cung cấp Google và Apple trong bảng điều khiển Supabase, dán mã
 *     ứng dụng và khoá bí mật lấy từ Google Cloud và Apple Developer.
 *  2. Thêm cấu hình native: Google cần mã ứng dụng riêng cho Android và iOS,
 *     Apple cần bật tính năng Sign in with Apple trong hồ sơ ứng dụng.
 *  3. Khai đường dẫn quay về (redirect URL) ở cả Supabase lẫn app.json, không
 *     thì trình duyệt đăng nhập xong không biết quay lại đâu.
 *
 * Trước khi làm, nhớ luật 4.8 của Apple: đã có Google thì BẮT BUỘC có thêm một
 * cách đăng nhập riêng tư, và Sign in with Apple là cách thoả mãn dễ nhất. Bỏ
 * một trong hai là bị trả hồ sơ.
 *
 * Việc gắn tài khoản ẩn danh đang có vào tài khoản thật nằm ở L08 của kế hoạch:
 * dùng linkIdentity của Supabase chứ đừng tạo tài khoản mới rồi chép dữ liệu,
 * chép tay là có ngày mất.
 * ────────────────────────────────────────────────────────────────────────────
 */

const CHUA_BAT =
  'Phần đăng nhập này chưa bật. Bạn chọn "Dùng ngay, không cần tài khoản" để vào app, ' +
  'đăng nhập sau trong mục Cá nhân cũng được.';

export async function dangNhapGoogle(): Promise<never> {
  throw new Error(CHUA_BAT);
}

export async function dangNhapApple(): Promise<never> {
  throw new Error(CHUA_BAT);
}
