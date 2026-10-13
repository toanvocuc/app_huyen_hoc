-- Chấm sao cho thầy tư vấn. CHỈ SỐ SAO, không có chữ.
--
-- Cố ý bỏ phần bình luận ở bản này. Có chữ do khách viết là app rơi vào diện
-- "nội dung do người dùng tạo", và Apple điều 1.2 bắt app loại đó phải lọc được
-- nội dung phản cảm, có đường báo cáo, chặn được người xấu. Kéo theo cả một
-- trang quản trị để duyệt từng câu.
--
-- Một con số từ 1 tới 5 thì không có gì để kiểm duyệt. Thêm chữ sau này cũng
-- chỉ là thêm một cột — nhưng lúc đó phải dựng xong phần duyệt trước.

create table danh_gia (
  chuyen_gia  text not null references chuyen_gia(ma) on delete cascade,
  nguoi_dung  uuid not null references auth.users(id) on delete cascade,
  sao         smallint not null check (sao between 1 and 5),
  tao_luc     timestamptz not null default now(),

  -- Mỗi người một lần chấm cho mỗi thầy. Không có ràng buộc này là một người
  -- chấm năm sao hai mươi lần, điểm trung bình thành vô nghĩa.
  primary key (chuyen_gia, nguoi_dung)
);

alter table danh_gia enable row level security;

-- Đọc: ai cũng đọc được. Chỉ là mấy con số, và app cần chúng để tính điểm.
create policy "ai cung doc duoc" on danh_gia for select using (true);

-- Viết: chỉ chấm được cho chính mình.
create policy "tu cham diem" on danh_gia for insert
  with check (nguoi_dung = auth.uid());
create policy "tu sua diem" on danh_gia for update
  using (nguoi_dung = auth.uid()) with check (nguoi_dung = auth.uid());

-- ---------------------------------------------------------------- điểm tổng

-- Giữ sẵn điểm trung bình trong bảng thầy, thay vì mỗi lần mở danh sách lại tải
-- hết đánh giá về rồi cộng ở máy khách.
alter table chuyen_gia add column diem_tb numeric(2,1);
alter table chuyen_gia add column so_danh_gia int not null default 0;

create or replace function cap_nhat_diem_thay() returns trigger
language plpgsql security definer as $$
declare ma_thay text;
begin
  ma_thay := coalesce(new.chuyen_gia, old.chuyen_gia);
  update chuyen_gia c
     set diem_tb     = (select round(avg(sao)::numeric, 1) from danh_gia where chuyen_gia = ma_thay),
         so_danh_gia = (select count(*) from danh_gia where chuyen_gia = ma_thay)
   where c.ma = ma_thay;
  return null;
end $$;

create trigger danh_gia_doi_thi_tinh_lai
  after insert or update or delete on danh_gia
  for each row execute function cap_nhat_diem_thay();
