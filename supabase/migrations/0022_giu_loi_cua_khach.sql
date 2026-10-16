-- Giữ nguyên lời của khách trong đơn, và báo thầy khi khách huỷ.
--
-- ───────────────────────────────────────────────────────────── VÌ SAO CẦN FILE NÀY
--
-- Luật khoá dòng "thay doi trang thai" ở migration 0014 chỉ xét HAI điều: người
-- gọi có làm chủ hồ sơ thầy không, và trạng thái mới có nằm trong ba giá trị cho
-- phép không. Nó KHÔNG xét các ô khác, mà `with check` của Postgres cũng không
-- đọc được giá trị cũ để mà so.
--
-- Hậu quả thật, đã thử tay và dính:
--
--   • Lúc đơn còn 'cho_nhan' thì mọi lệnh sửa đều bị chặn — nhưng chặn NHỜ MAY:
--     dòng mới vẫn mang trạng thái 'cho_nhan' nên trượt `with check`.
--   • Thầy nhận đơn xong (trạng thái thành 'da_nhan') thì sửa được hết: câu hỏi,
--     khung giờ, ngày hẹn, tên khách, và cả ô `nguoi_dung` — tức là chuyển đơn
--     sang tên người khác.
--
-- Chú thích trong `lib/yeu-cau.ts` nói luật khoá dòng đã chặn mấy ô đó. Lời đó
-- sai, và chỗ sai kiểu này nguy hơn cả không có chú thích: người đọc sau tin là
-- đã được bảo vệ rồi nên không kiểm lại.
--
-- ───────────────────────────────────────────────────────────── CÁCH CHỮA
--
-- Không thể chữa bằng luật khoá dòng, vì `with check` không thấy dòng cũ. Nên
-- dùng trigger BEFORE UPDATE: ai không phải chủ đơn thì mọi ô của khách bị gán
-- lại bằng giá trị cũ. Lệnh sửa không bị từ chối, nó chỉ không có tác dụng —
-- cách này còn chắc hơn chặn, vì chặn thì phải đoán đủ mọi đường lách.
--
-- `auth.uid() is null` nghĩa là lệnh đi từ khoá quản trị hoặc từ một hàm trong
-- máy chủ. Mấy đường đó cố ý KHÔNG bị kẹp: thiếu chỗ chừa này thì script nạp
-- dữ liệu và mấy hàm security definer đều hỏng theo.

create or replace function giu_loi_cua_khach() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Không có người gọi cụ thể: khoá quản trị hoặc hàm trong máy chủ. Để yên.
  if auth.uid() is null then
    return new;
  end if;

  if auth.uid() <> old.nguoi_dung then
    -- Người gọi KHÔNG phải chủ đơn, tức là thầy. Thầy chỉ được đụng vào
    -- `trang_thai` và `ly_do`; mọi ô còn lại là lời của khách.
    new.nguoi_dung := old.nguoi_dung;
    new.chuyen_gia := old.chuyen_gia;
    new.chu_de     := old.chu_de;
    new.khung_gio  := old.khung_gio;
    new.ngay_hen   := old.ngay_hen;
    new.cau_hoi    := old.cau_hoi;
    new.ten_khach  := old.ten_khach;
    new.tao_luc    := old.tao_luc;
  else
    -- Chính khách. Khách không được viết hộ lý do từ chối của thầy.
    new.ly_do := old.ly_do;
  end if;

  return new;
end $$;

-- Tên bắt đầu bằng 'a_' có chủ ý: Postgres chạy trigger BEFORE theo thứ tự tên,
-- nên hàm này chạy trước `yeu_cau_doi_thi_cham_gio`. Không phải vì hai hàm đụng
-- nhau, mà để sau này thêm trigger nữa thì thứ tự còn đoán được.
drop trigger if exists a_giu_loi_cua_khach on yeu_cau_tu_van;
create trigger a_giu_loi_cua_khach
before update on yeu_cau_tu_van
for each row execute function giu_loi_cua_khach();

-- ──────────────────────────────────────────────────── khách huỷ thì báo cho thầy
--
-- Trước đây đường này im hoàn toàn. Khách huỷ, đơn tụt xuống mục Lịch sử bên
-- máy khách, còn bên thầy nó chỉ đổi chữ — mà thầy không có lý do gì để mở lại
-- một đơn mình đã xem. Nên thầy vẫn giữ chỗ cho buổi hẹn đã không còn.
--
-- `bao_khach_don_doi` cố ý không làm việc này: hàm đó lo tin gửi CHO KHÁCH, và
-- nó chặn ngay ở đầu khi người bấm chính là khách.

create or replace function bao_thay_khach_huy() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  tai_khoan_thay uuid;
  ngay text;
begin
  if new.trang_thai <> 'da_huy' or old.trang_thai = 'da_huy' then
    return null;
  end if;

  -- Chỉ khi CHÍNH KHÁCH bấm huỷ. Thầy từ chối cũng đặt 'da_huy', mà báo lại cho
  -- chính người vừa bấm thì vô nghĩa.
  if auth.uid() is null or auth.uid() <> new.nguoi_dung then
    return null;
  end if;

  select tai_khoan into tai_khoan_thay
    from public.lien_he_chuyen_gia where chuyen_gia = new.chuyen_gia;
  if tai_khoan_thay is null then
    return null;
  end if;

  ngay := coalesce(to_char(new.ngay_hen, 'DD/MM'), 'chưa chọn ngày');

  insert into public.thong_bao (nguoi_nhan, loai, tieu_de, noi_dung, duong_dan)
  values (
    tai_khoan_thay,
    'dat_lich',
    'Khách đã huỷ một đơn',
    coalesce(new.ten_khach, 'Khách') || ' huỷ buổi ' || new.chu_de
      || ' ngày ' || ngay || ' · ' || new.khung_gio || '. Bạn không cần giữ chỗ nữa.',
    '/thay'
  );
  return null;
end $$;

drop trigger if exists khach_huy_thi_bao_thay on yeu_cau_tu_van;
create trigger khach_huy_thi_bao_thay
after update on yeu_cau_tu_van
for each row execute function bao_thay_khach_huy();

-- ────────────────────────────────────────────── khoá search_path cho hàm cũ
--
-- `cham_cap_nhat_luc` ở migration 0011 không khai `set search_path`. Hàm nó
-- không gọi gì nên chưa sinh ra chuyện, nhưng bộ soát của Supabase vẫn kêu, và
-- một hàm để search_path mở là chỗ chờ sẵn cho lỗi về sau.

create or replace function cham_cap_nhat_luc() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.cap_nhat_luc := now();
  return new;
end $$;
