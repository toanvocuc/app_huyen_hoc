-- Yêu cầu tư vấn: khách đặt lịch với một thầy cụ thể.
--
-- Đây là lý do bảng này tồn tại, nên ghi rõ: Apple từ chối app theo điều 4.3(b)
-- vì nó "chủ yếu là tarot và chiêm tinh" — một danh mục đã bão hoà. Đường ra là
-- đưa việc đặt lịch tư vấn với người thật lên làm chức năng chính, còn tarot lùi
-- xuống mục tra cứu.
--
-- Nhưng một cái nút mở sang Zalo thì KHÔNG đủ để gọi là chức năng chính — lúc đó
-- app chỉ là lối tắt sang ứng dụng khác, và sẽ dính điều 4.2 thay vì 4.3. Bảng
-- này là phần ruột để app có việc của riêng nó: khách gửi yêu cầu trong app, và
-- theo dõi được nó đi tới đâu.

create table yeu_cau_tu_van (
  ma          uuid primary key default gen_random_uuid(),
  chuyen_gia  text not null references chuyen_gia(ma) on delete cascade,
  nguoi_dung  uuid not null references auth.users(id) on delete cascade,

  -- Lấy từ cột chuyen_sau của thầy, tách theo dấu phẩy. Cố ý không làm bảng
  -- chủ đề riêng: thầy đổi chuyên môn thì sửa một ô, không phải sửa hai bảng.
  chu_de     text not null,

  -- Khung giờ cố định chứ không cho chọn ngày giờ cụ thể. Thầy trả lời qua Zalo
  -- theo nhịp của mình, hẹn chính xác 14h07 là hứa một thứ không giữ được.
  khung_gio  text not null,

  cau_hoi    text not null,

  -- cho_nhan  : khách vừa gửi, thầy chưa xem
  -- da_nhan   : thầy đã nhận, đang xếp lịch
  -- da_xong   : đã tư vấn xong
  -- da_huy    : khách tự huỷ khi thầy chưa nhận
  trang_thai text not null default 'cho_nhan'
    check (trang_thai in ('cho_nhan', 'da_nhan', 'da_xong', 'da_huy')),

  tao_luc      timestamptz not null default now(),
  cap_nhat_luc timestamptz not null default now()
);

-- Màn "Lịch của tôi" luôn hỏi theo người và xếp theo thời gian giảm dần.
create index yeu_cau_cua_toi on yeu_cau_tu_van (nguoi_dung, tao_luc desc);

alter table yeu_cau_tu_van enable row level security;

-- Đọc: CHỈ dòng của mình. Khác hẳn bảng danh_gia vốn ai đọc cũng được — ở đó là
-- mấy con số, còn ở đây là câu hỏi riêng tư của khách.
create policy "chi doc yeu cau cua minh" on yeu_cau_tu_van for select
  using (nguoi_dung = auth.uid());

create policy "tu gui yeu cau" on yeu_cau_tu_van for insert
  with check (nguoi_dung = auth.uid());

-- Sửa: khách CHỈ được tự huỷ, và chỉ khi thầy chưa nhận. Cho sửa thoải mái thì
-- khách tự bấm thành 'da_xong' được, mà cột đó là thứ phía thầy dùng để biết còn
-- việc nào đang treo.
create policy "tu huy khi thay chua nhan" on yeu_cau_tu_van for update
  using (nguoi_dung = auth.uid() and trang_thai = 'cho_nhan')
  with check (nguoi_dung = auth.uid() and trang_thai = 'da_huy');

-- Xoá: để khách xoá được dòng của mình, vì màn "Xoá toàn bộ dữ liệu" phải dọn
-- sạch bảng này. Thiếu luật này là lệnh xoá chạy qua mà không xoá được gì,
-- đúng kiểu lỗi vừa vá ở bảng danh_gia.
create policy "tu xoa yeu cau cua minh" on yeu_cau_tu_van for delete
  using (nguoi_dung = auth.uid());

create or replace function cham_cap_nhat_luc() returns trigger
language plpgsql as $$
begin
  new.cap_nhat_luc := now();
  return new;
end $$;

create trigger yeu_cau_doi_thi_cham_gio
  before update on yeu_cau_tu_van
  for each row execute function cham_cap_nhat_luc();
