-- Nối dây cho hộp thông báo dùng chung.
--
-- Hai việc:
--   1. Có dòng mới trong `thong_bao` thì đẩy tin về máy người nhận.
--   2. Có đơn mới thì ghi một dòng `thong_bao` cho THẦY.
--
-- Trước đây hàm `bao-don-moi` vừa đẩy tin vừa gửi email. Giờ nó chỉ còn lo
-- email, phần đẩy tin chuyển sang `day-thong-bao` dùng chung — để hai chỗ cùng
-- đẩy thì thầy nhận hai lần rung cho một đơn, và hai đoạn mã làm cùng một việc
-- chắc chắn sẽ lệch nhau theo thời gian.

-- ---------------------------------------------------------------- 1. đẩy tin

create or replace function day_thong_bao_vua_ghi() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://dgoyowwhblqmdsnpxwgo.supabase.co/functions/v1/day-thong-bao',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer KHOA_CONG_KHAI',
      'x-bi-mat', 'BI_MAT_WEBHOOK'
    ),
    body := jsonb_build_object('record', to_jsonb(new)),
    timeout_milliseconds := 5000
  );
  return null;
end $$;

drop trigger if exists thong_bao_moi_thi_day on thong_bao;
create trigger thong_bao_moi_thi_day
after insert on thong_bao
for each row execute function day_thong_bao_vua_ghi();

-- ---------------------------------------------------------------- 2. đơn mới thì báo thầy

-- Thầy cũng có chuông như khách. Trước đây chuông của thầy luôn trống vì không
-- ai ghi dòng nào cho thầy cả — thầy chỉ nhận được tiếng rung rồi thôi.
create or replace function bao_thay_don_moi() returns trigger
language plpgsql security definer set search_path = '' as $$
declare tai_khoan_thay uuid;
begin
  select tai_khoan into tai_khoan_thay
    from public.lien_he_chuyen_gia where chuyen_gia = new.chuyen_gia;

  -- Thầy chưa đăng nhập tư cách chuyên gia thì chưa có chỗ nào để ghi vào.
  if tai_khoan_thay is null then
    return null;
  end if;

  insert into public.thong_bao (nguoi_nhan, loai, tieu_de, noi_dung, duong_dan)
  values (
    tai_khoan_thay,
    'dat_lich',
    'Đơn mới · ' || new.chu_de,
    coalesce(new.ten_khach, 'Khách') || ' · ' || new.khung_gio || E'
' || new.cau_hoi,
    '/thay'
  );
  return null;
end $$;

drop trigger if exists don_moi_thi_bao_thay on yeu_cau_tu_van;
create trigger don_moi_thi_bao_thay
after insert on yeu_cau_tu_van
for each row execute function bao_thay_don_moi();
