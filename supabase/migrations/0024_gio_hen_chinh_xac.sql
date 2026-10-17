-- Giờ hẹn chính xác, thay vì chỉ có khung giờ chung chung.
--
-- ───────────────────────────────────────────────────────── VÌ SAO THÊM CỘT MỚI
--
-- `khung_gio` là một trong bốn chuỗi cho sẵn: 'Sáng, 9h tới 11h', 'Chiều, 14h
-- tới 16h', 'Tối, 19h tới 21h', 'Giờ nào cũng được'. Khoảng hai tiếng thì cả
-- khách lẫn thầy đều không giữ được giờ giấc, mà lời nhắc trước buổi hẹn cũng
-- chỉ đoán được giờ bắt đầu khung.
--
-- Thêm cột riêng chứ KHÔNG nhét giờ vào `khung_gio`:
--
--   • `khung_gio` là chữ để đọc, còn đây là giờ để TÍNH. Trộn hai thứ vào một ô
--     thì mỗi chỗ dùng lại phải bóc chuỗi bằng biểu thức, và sớm muộn có chỗ
--     bóc sai.
--   • Đơn đặt trước khi có cột này vẫn chạy: ô để trống, mọi chỗ đọc đều có
--     đường lùi về `khung_gio`.
--
-- Dạng 'HH:mm' chứ không dùng kiểu `time`: app đọc ra là dùng thẳng để hiện và
-- để hẹn giờ, không phải đổi qua lại.

alter table yeu_cau_tu_van add column gio_hen text;

comment on column yeu_cau_tu_van.gio_hen is
  'Gio hen chinh xac dang HH:mm. Trong = khach chon khung gio chung chung.';

-- Chặn giá trị vô nghĩa ngay dưới máy chủ. Khách gõ gì thì app lo, nhưng dữ
-- liệu hỏng mà lọt xuống đây là mọi chỗ đọc sau này đều phải tự phòng thân.
alter table yeu_cau_tu_van add constraint gio_hen_dung_khuon
  check (gio_hen is null or gio_hen ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

-- ──────────────────────────────────────────────── giữ lời khách, thêm ô mới
--
-- `gio_hen` là giờ KHÁCH chọn, nên thầy không được sửa. Thiếu đoạn này thì
-- trigger ở migration 0022 bỏ sót đúng ô vừa thêm.

create or replace function giu_loi_cua_khach() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if auth.uid() <> old.nguoi_dung then
    new.nguoi_dung := old.nguoi_dung;
    new.chuyen_gia := old.chuyen_gia;
    new.chu_de     := old.chu_de;
    new.khung_gio  := old.khung_gio;
    new.ngay_hen   := old.ngay_hen;
    new.gio_hen    := old.gio_hen;
    new.cau_hoi    := old.cau_hoi;
    new.ten_khach  := old.ten_khach;
    new.tao_luc    := old.tao_luc;
    new.goi        := old.goi;
    new.gia_goi    := old.gia_goi;
  else
    new.ly_do := old.ly_do;
  end if;

  return new;
end $$;

-- ──────────────────────────────────── báo thầy khi khách huỷ: nói đúng giờ
--
-- Hàm ở migration 0022 chỉ đọc `khung_gio`. Giờ ưu tiên giờ chính xác nếu có.

create or replace function bao_thay_khach_huy() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  tai_khoan_thay uuid;
  ngay text;
  gio  text;
begin
  if new.trang_thai <> 'da_huy' or old.trang_thai = 'da_huy' then
    return null;
  end if;

  if auth.uid() is null or auth.uid() <> new.nguoi_dung then
    return null;
  end if;

  select tai_khoan into tai_khoan_thay
    from public.lien_he_chuyen_gia where chuyen_gia = new.chuyen_gia;
  if tai_khoan_thay is null then
    return null;
  end if;

  ngay := coalesce(to_char(new.ngay_hen, 'DD/MM'), 'chưa chọn ngày');
  gio  := coalesce(new.gio_hen, new.khung_gio);

  insert into public.thong_bao (nguoi_nhan, loai, tieu_de, noi_dung, duong_dan)
  values (
    tai_khoan_thay,
    'dat_lich',
    'Khách đã huỷ một đơn',
    coalesce(new.ten_khach, 'Khách') || ' huỷ buổi ' || new.chu_de
      || ' ngày ' || ngay || ' · ' || gio || '. Bạn không cần giữ chỗ nữa.',
    '/thay'
  );
  return null;
end $$;

-- ──────────────────────────────────── báo thầy đơn mới: nói đúng giờ
--
-- Hàm ở migration 0021 cũng chỉ đọc `khung_gio`.

create or replace function bao_thay_don_moi() returns trigger
language plpgsql security definer set search_path = '' as $$
declare tai_khoan_thay uuid;
begin
  select tai_khoan into tai_khoan_thay
    from public.lien_he_chuyen_gia where chuyen_gia = new.chuyen_gia;

  if tai_khoan_thay is null then
    return null;
  end if;

  insert into public.thong_bao (nguoi_nhan, loai, tieu_de, noi_dung, duong_dan)
  values (
    tai_khoan_thay,
    'dat_lich',
    'Đơn mới · ' || new.chu_de,
    coalesce(new.ten_khach, 'Khách') || ' · ' || coalesce(new.gio_hen, new.khung_gio) || E'
' || new.cau_hoi,
    '/thay'
  );
  return null;
end $$;
