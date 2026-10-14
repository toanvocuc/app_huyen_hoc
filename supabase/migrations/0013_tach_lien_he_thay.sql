-- Tách thông tin liên hệ của thầy ra khỏi bảng hồ sơ.
--
-- SỬA MỘT LỖI THẬT, không phải dọn dẹp cho đẹp.
--
-- Migration 0012 thêm cột `email` vào bảng `chuyen_gia`. Nhưng bảng đó có luật
-- "ai cũng đọc được" — bắt buộc phải thế, vì app cần hiện danh sách thầy cho
-- cả khách chưa đăng nhập. Hệ quả: địa chỉ email cá nhân của thầy đọc được
-- bằng khoá công khai, thứ nằm trong mọi bản app đã phát hành và trong cả repo
-- công khai trên GitHub.
--
-- Giữ email khỏi repo mà vẫn để nó trong bảng đọc chung thì chặn cửa trước, hở
-- cửa sau. Phát hiện ra lúc đọc thử bằng đúng khoá mà app cầm:
--
--     doc bang khoa cong khai: [{"email":"...@gmail.com"}]
--
-- VÌ SAO LÀ BẢNG RIÊNG, KHÔNG PHẢI THU HỒI QUYỀN TRÊN CỘT
--
-- Cách gọn hơn trông có vẻ là `revoke select (email) ... from anon`. Nhưng hàm
-- `useBang` trong app gọi `select('*')`, mà Postgres bung dấu sao đó ra thành
-- TOÀN BỘ cột rồi mới xét quyền — thiếu quyền một cột là cả câu lệnh hỏng, và
-- danh sách thầy trắng trơn với mọi khách. Bảng riêng thì không có đường nào
-- lọt, và không phụ thuộc việc app chọn cột thế nào.

create table lien_he_chuyen_gia (
  chuyen_gia   text primary key references chuyen_gia(ma) on delete cascade,
  email        text,
  ghi_chu      text,
  cap_nhat_luc timestamptz not null default now()
);

alter table lien_he_chuyen_gia enable row level security;

-- CỐ Ý KHÔNG khai một luật nào. Bật khoá dòng mà không có luật nghĩa là khoá
-- công khai và khoá người dùng đều không đọc được dòng nào — chỉ khoá quản trị
-- đi xuyên qua được, và nó chỉ sống trong Edge Function.
--
-- Thêm luật cho bảng này về sau thì phải hỏi lại: ai thật sự cần đọc email của
-- thầy? Câu trả lời gần như luôn là "không ai, ngoài máy chủ".

alter table chuyen_gia drop column email;
