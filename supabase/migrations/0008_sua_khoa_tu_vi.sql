-- Vá: bảng tu_vi_mau bật khoá dòng nhưng thiếu luật cho đọc.
--
-- Chạy file 0007 xong thì bảng có đủ 252 dòng khi đọc bằng khoá quản trị, nhưng
-- đọc bằng khoá công khai thì ra 0. Mà app chỉ cầm khoá công khai, nên mục tử vi
-- hiện ra trống trơn với mọi khách.
--
-- Nguyên nhân là câu `create policy` cuối file 0007 không chạy. Trình SQL của
-- Supabase chỉ chạy phần đang bôi đen, nên dán cả file mà bôi thiếu mấy dòng
-- cuối là ra đúng tình trạng này.
--
-- Chạy lại được nhiều lần, không sao cả.

alter table tu_vi_mau enable row level security;

drop policy if exists "ai cung doc duoc" on tu_vi_mau;
create policy "ai cung doc duoc" on tu_vi_mau for select using (true);
