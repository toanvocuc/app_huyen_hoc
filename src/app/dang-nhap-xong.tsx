import { Redirect } from 'expo-router';

/**
 * Chỗ hứng địa chỉ `omora://dang-nhap-xong` mà trình duyệt trả về.
 *
 * Bình thường màn này KHÔNG hiện. `WebBrowser.openAuthSessionAsync` chặn địa
 * chỉ đó lại và trả thẳng về cho hàm gọi nó, rồi tự đóng trình duyệt.
 *
 * Nhưng có lúc hệ điều hành đẩy đường dẫn vào app theo đường khác: khách bấm
 * nút quay lại giữa chừng, hoặc máy khôi phục app sau khi bị thu hồi bộ nhớ.
 * Thiếu màn này thì expo-router không biết `/dang-nhap-xong` là gì và hiện
 * trang báo không tìm thấy — khách đăng nhập xong lại thấy màn lỗi.
 *
 * Đá thẳng về màn gốc. Phiên lúc đó đã lưu xong rồi, nên màn gốc tự biết đưa
 * khách vào phần nhập hồ sơ hay vào thẳng app.
 */
export default function DangNhapXong() {
  return <Redirect href="/" />;
}
