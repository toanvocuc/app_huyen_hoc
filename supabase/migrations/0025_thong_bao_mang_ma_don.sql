-- Thông báo mang theo mã đơn, để bấm vào là tới đúng đơn đó.
--
-- ───────────────────────────────────────────────────────────── CHUYỆN ĐANG HỎNG
--
-- Mọi dòng thông báo về đặt lịch đều ghi `duong_dan` là '/thay' hoặc
-- '/lich-cua-toi' — tức là CẢ DANH SÁCH, không phải một đơn.
--
-- Nên thầy có mười đơn, nhận thông báo về đơn thứ bảy, bấm vào thì app mở danh
-- sách ở đầu trang. Thầy phải tự dò xuống tìm đơn nào vừa đổi. Thông báo chỉ
-- xong một nửa việc: nó gọi được người ta tới, nhưng tới rồi lại bỏ giữa đường.
--
-- Thêm `?don=<mã>` vào đường dẫn. Màn hình đọc tham số đó rồi cuộn tới đúng thẻ
-- và tô sáng nó một lúc.
--
-- Đơn cũ đã gửi thông báo trước migration này thì đường dẫn vẫn trơn, và vẫn
-- chạy đúng như cũ — mở danh sách ở đầu trang. Không có gì vỡ.

-- ──────────────────────────────────────────────────────────── đơn mới -> thầy

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
    '/thay?don=' || new.ma
  );
  return null;
end $$;

-- ────────────────────────────────────────────────────── đơn đổi trạng thái -> khách

create or replace function bao_khach_don_doi() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  ten_thay text;
  tieu text;
  noi  text;
begin
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
    noi  := coalesce(nullif(trim(new.ly_do), ''), 'Thầy không để lại lý do.');
  elsif new.trang_thai = 'da_xong' then
    tieu := 'Buổi tư vấn với ' || ten_thay || ' đã xong';
    noi  := 'Cảm ơn bạn. Bạn chấm sao cho thầy ở trang hồ sơ nhé.';
  else
    return null;
  end if;

  insert into public.thong_bao (nguoi_nhan, loai, tieu_de, noi_dung, duong_dan)
  values (new.nguoi_dung, 'dat_lich', tieu, noi, '/lich-cua-toi?don=' || new.ma);

  return null;
end $$;

-- ─────────────────────────────────────────────────────────── khách huỷ -> thầy

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
    '/thay?don=' || new.ma
  );
  return null;
end $$;
