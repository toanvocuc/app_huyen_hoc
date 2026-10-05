-- Biểu đồ ngày sinh: hai bảng chữ nghĩa cho phần ô vuông ba hàng ba cột.
--
-- Cách xếp số vào ô và cách dò mũi tên nằm trong code (src/lib/bieu-do-ngay-sinh.ts),
-- vì đó là phép tính chứ không phải nội dung. Ở đây chỉ giữ phần đọc cho khách,
-- để sửa câu chữ mà không phải phát hành lại app.

create table mui_ten_bieu_do (
  ma         text primary key,          -- day-1-5-9, trong-1-5-9, ...
  cac_so     text not null,             -- '1-5-9'
  loai       text not null check (loai in ('day', 'trong')),
  ten        text not null,
  y_nghia    text not null,
  loi_khuyen text not null
);

create table con_so_bieu_do (
  so         int primary key check (so between 1 and 9),
  ten        text not null,
  khi_thieu  text not null,             -- không có số này trong ngày sinh
  khi_co     text not null,             -- có 1 tới 2 lần
  khi_nhieu  text not null              -- có từ 3 lần trở lên
);

-- Khoá dòng bật ngay tại đây, cùng file với lệnh tạo bảng. Hai bảng này là nội
-- dung chung nên ai đọc cũng được, nhưng không ai ghi được từ app.
alter table mui_ten_bieu_do enable row level security;
alter table con_so_bieu_do  enable row level security;

create policy "ai cung doc duoc" on mui_ten_bieu_do for select using (true);
create policy "ai cung doc duoc" on con_so_bieu_do  for select using (true);
