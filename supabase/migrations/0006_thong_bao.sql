-- Thông báo đẩy.
--
-- Hai cột trên ho_so giữ lựa chọn bật tắt của khách. Trước đây màn cài đặt có hai
-- công tắc nhưng chúng chỉ nằm trong bộ nhớ màn hình, thoát ra là mất, nên không
-- ai thật sự tắt được thứ gì.

alter table ho_so add column if not exists nhac_la_bai boolean not null default true;
alter table ho_so add column if not exists nhac_tin_tuc boolean not null default false;

-- Mã thiết bị, để trang quản trị gửi tin theo đợt.
--
-- Khoá chính là mã thiết bị chứ không phải người dùng: một người có thể cài app
-- trên nhiều máy, và mỗi máy một mã riêng. Lấy người dùng làm khoá thì máy sau
-- ghi đè máy trước, khách đổi điện thoại là máy cũ im luôn mà không ai biết.
create table thiet_bi (
  ma_day       text primary key,
  nguoi_dung   uuid not null references auth.users(id) on delete cascade,
  nen_tang     text check (nen_tang in ('ios', 'android', 'web')),
  cap_nhat_luc timestamptz not null default now()
);

create index thiet_bi_nguoi_dung_idx on thiet_bi (nguoi_dung);

-- Khoá dòng bật ngay tại đây, cùng file với lệnh tạo bảng.
alter table thiet_bi enable row level security;

-- Khách chỉ đụng được vào dòng của máy mình. Trang quản trị gửi tin theo đợt thì
-- đọc bằng khoá quản trị từ máy chủ, không đọc bằng khoá công khai của app.
create policy "doc thiet bi cua minh" on thiet_bi for select using (auth.uid() = nguoi_dung);
create policy "ghi thiet bi cua minh" on thiet_bi for insert with check (auth.uid() = nguoi_dung);
create policy "sua thiet bi cua minh" on thiet_bi for update using (auth.uid() = nguoi_dung);
create policy "xoa thiet bi cua minh" on thiet_bi for delete using (auth.uid() = nguoi_dung);
