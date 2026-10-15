-- Cho thầy đọc đúng dòng của chính mình trong bảng liên hệ.
--
-- VÁ MỘT MÂU THUẪN TÔI TỰ TẠO RA
--
-- Migration 0013 khoá kín bảng `lien_he_chuyen_gia`: bật khoá dòng mà không
-- khai luật nào, nên không ai đọc được ngoài khoá quản trị. Đúng ý lúc đó, vì
-- bảng chứa email cá nhân của thầy.
--
-- Nhưng rồi `src/lib/thay.ts` lại hỏi chính bảng đó từ app, để biết tài khoản
-- đang đăng nhập làm chủ hồ sơ thầy nào. Hai thứ không thể cùng đúng: app đăng
-- nhập đúng mật khẩu mà vẫn bị báo "chưa được cấp quyền chuyên gia".
--
-- Bắt được lúc đăng nhập thử bằng một phiên thật, không phải lúc đọc lại code.
--
-- Luật này hẹp nhất có thể: chỉ dòng mà `tai_khoan` khớp người đang gọi. Khách
-- thường không khớp dòng nào nên vẫn đọc ra rỗng, email của thầy vẫn kín.
-- Thầy đọc được email của chính mình — không có gì để giấu ở đó.

create policy "thay doc dong cua minh" on lien_he_chuyen_gia for select
  using (tai_khoan = auth.uid());
