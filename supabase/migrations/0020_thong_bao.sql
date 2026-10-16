-- Hộp thông báo trong app, và hai ô mới cho đơn tư vấn.
--
-- DỰNG CHUNG NGAY TỪ ĐẦU
--
-- Hiện chỉ có việc đặt lịch sinh ra thông báo. Nhưng sắp tới còn đơn hàng của
-- shop và mấy thứ khác, nên bảng này cố ý KHÔNG biết gì về tư vấn: nó chỉ có
-- người nhận, loại, tiêu đề, nội dung và một đường dẫn để bấm vào.
--
-- Thêm nguồn mới về sau chỉ là ghi thêm một dòng vào đây, không phải dựng lại.

-- ---------------------------------------------------------------- hai ô mới cho đơn

-- Ngày khách muốn gặp. Khung giờ đã có từ trước, giờ thêm ngày.
alter table yeu_cau_tu_van add column ngay_hen date;

-- Lý do thầy từ chối, thầy tự viết. Khách phải biết vì sao chứ không phải chỉ
-- thấy chữ "đã huỷ" rồi tự đoán.
alter table yeu_cau_tu_van add column ly_do text;

-- ---------------------------------------------------------------- hộp thông báo

create table thong_bao (
  ma         uuid primary key default gen_random_uuid(),
  nguoi_nhan uuid not null references auth.users(id) on delete cascade,

  -- 'dat_lich' bây giờ, sau này thêm 'don_hang', 'khuyen_mai'...
  loai       text not null,

  tieu_de    text not null,
  noi_dung   text,

  -- Bấm vào thông báo thì mở màn nào. Để trống là chỉ đọc, không đi đâu.
  duong_dan  text,

  da_doc     boolean not null default false,
  tao_luc    timestamptz not null default now()
);

-- Hộp thông báo luôn hỏi theo người nhận và xếp mới nhất lên trước.
create index thong_bao_cua_toi on thong_bao (nguoi_nhan, tao_luc desc);

alter table thong_bao enable row level security;

create policy "doc thong bao cua minh" on thong_bao for select
  using (nguoi_nhan = auth.uid());

-- Đánh dấu đã đọc. `with check` giữ nguyên người nhận để không ai chuyển thông
-- báo của mình sang người khác.
create policy "danh dau da doc" on thong_bao for update
  using (nguoi_nhan = auth.uid())
  with check (nguoi_nhan = auth.uid());

create policy "xoa thong bao cua minh" on thong_bao for delete
  using (nguoi_nhan = auth.uid());

-- CỐ Ý KHÔNG có luật cho thêm dòng. Thông báo chỉ sinh ra từ máy chủ, không từ
-- máy khách — cho khách tự thêm là ai cũng nhét được chữ vào hộp của người khác.

-- ---------------------------------------------------------------- đơn đổi thì báo khách

create or replace function bao_khach_don_doi() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  ten_thay text;
  tieu text;
  noi  text;
begin
  -- Chỉ quan tâm lúc trạng thái thật sự đổi.
  if new.trang_thai = old.trang_thai then
    return null;
  end if;

  -- Khách tự huỷ thì không báo lại cho chính khách. Họ vừa bấm xong, biết rồi.
  if auth.uid() = new.nguoi_dung then
    return null;
  end if;

  select ten into ten_thay from public.chuyen_gia where ma = new.chuyen_gia;
  ten_thay := coalesce(ten_thay, 'Chuyên gia');

  if new.trang_thai = 'da_nhan' then
    tieu := ten_thay || ' đã nhận đơn của bạn';
    noi  := 'Chủ đề ' || new.chu_de || '. Thầy sẽ hẹn bạn qua kênh liên lạc bạn để lại.';
  elsif new.trang_thai = 'da_huy' then
    tieu := ten_thay || ' chưa nhận được đơn này';
    -- Lý do do thầy viết tay. Không có thì nói thẳng là không có, đừng bịa.
    noi  := coalesce(nullif(trim(new.ly_do), ''), 'Thầy không để lại lý do.');
  elsif new.trang_thai = 'da_xong' then
    tieu := 'Buổi tư vấn với ' || ten_thay || ' đã xong';
    noi  := 'Cảm ơn bạn. Bạn chấm sao cho thầy ở trang hồ sơ nhé.';
  else
    return null;
  end if;

  insert into public.thong_bao (nguoi_nhan, loai, tieu_de, noi_dung, duong_dan)
  values (new.nguoi_dung, 'dat_lich', tieu, noi, '/lich-cua-toi');

  return null;
end $$;

create trigger don_doi_thi_bao_khach
after update on yeu_cau_tu_van
for each row execute function bao_khach_don_doi();
