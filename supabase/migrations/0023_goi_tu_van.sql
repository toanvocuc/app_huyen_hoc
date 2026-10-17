-- Gói tư vấn: tách ba mức giá của thầy thành ba thứ bấm được.
--
-- ───────────────────────────────────────────────────────── VÌ SAO CẦN BẢNG NÀY
--
-- Giá của thầy đang nằm trong ô `chuyen_gia.gom_gi`, dạng một đoạn văn:
--
--   "150.000đ cho một câu hỏi cụ thể. 300.000đ cho buổi 30 phút.
--    500.000đ cho buổi 60 phút, kết hợp chiêm tinh và hành trình linh hồn."
--
-- Đó là BA DỊCH VỤ khác nhau, bị gộp thành một khối chữ mà khách phải tự đọc,
-- tự so, rồi tự nhắn hỏi lại. App không biết khách muốn gói nào, thầy mở đơn ra
-- cũng không biết, nên vẫn phải hỏi lại tay — đúng cái việc app sinh ra để bỏ.
--
-- Tách ra bảng riêng chứ không nhét thêm ba cột vào `chuyen_gia`: thầy này có
-- ba gói, thầy sau có thể có một hoặc năm.
--
-- ─────────────────────────────────────────────────────────── CHỤP ẢNH GIÁ LÚC ĐẶT
--
-- Đơn giữ TÊN và GIÁ của gói ngay lúc đặt, không chỉ giữ khoá ngoại. Thầy tăng
-- giá tháng sau thì đơn cũ phải còn nguyên giá đã thoả thuận — nếu đọc giá qua
-- khoá ngoại thì mọi đơn cũ tự nhảy giá theo, và không ai biết lúc đặt là bao
-- nhiêu. Cùng lý do với `ten_khach` ở migration 0015.

create table goi_tu_van (
  ma         uuid primary key default gen_random_uuid(),
  chuyen_gia text not null references chuyen_gia(ma) on delete cascade,

  ten    text not null,          -- 'Buổi 30 phút'
  mo_ta  text,                   -- thầy làm gì trong gói này
  gia    int  not null,          -- đồng
  phut   int,                    -- null với gói không tính theo thời lượng

  -- Thầy tạm ngưng nhận một gói mà không muốn xoá hẳn.
  dang_nhan boolean not null default true,
  thu_tu    int not null default 0
);

create index goi_cua_thay on goi_tu_van (chuyen_gia, thu_tu);

alter table goi_tu_van enable row level security;

-- Ai cũng đọc được, kể cả khách chưa đăng nhập: bảng giá phải xem được trước
-- khi quyết định có tạo tài khoản hay không.
create policy "ai cung xem duoc goi" on goi_tu_van for select using (true);

-- Cố ý KHÔNG có luật ghi. Giá do công ty đặt, không ai sửa từ máy khách.

-- ──────────────────────────────────────────────────────────── đơn nhớ gói đã chọn

alter table yeu_cau_tu_van add column goi     text;
alter table yeu_cau_tu_van add column gia_goi int;

comment on column yeu_cau_tu_van.goi is
  'Ten goi luc dat. Chup lai, khong doc qua khoa ngoai.';
comment on column yeu_cau_tu_van.gia_goi is
  'Gia luc dat, dong. Thay doi gia sau nay khong duoc lam doi don cu.';

-- Hai ô này là lời khách chọn, nên trigger giữ-lời-khách ở migration 0022 phải
-- giữ chúng luôn. Thiếu đoạn này thì thầy nhận đơn xong vẫn sửa được giá.
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

-- ──────────────────────────────────────────────────────────── ba gói của Luna
--
-- Chép đúng lời chị ấy trong ô `gom_gi`, không thêm bớt dịch vụ nào.

insert into goi_tu_van (chuyen_gia, ten, mo_ta, gia, phut, thu_tu) values
  ('luna-chiem-tinh', 'Một câu hỏi cụ thể',
   'Bạn có đúng một chuyện đang vướng và muốn một câu trả lời thẳng. Luna đọc hoàn cảnh bạn viết rồi trả lời riêng cho câu đó.',
   150000, null, 1),

  ('luna-chiem-tinh', 'Buổi 30 phút',
   'Đủ thời gian để đi hết một chuyện và hỏi lại những chỗ còn lấn cấn, thay vì chỉ nhận một câu trả lời rồi thôi.',
   300000, 30, 2),

  ('luna-chiem-tinh', 'Buổi 60 phút',
   'Buổi dài nhất, kết hợp chiêm tinh và hành trình linh hồn. Dành cho lúc bạn muốn nhìn cả giai đoạn chứ không chỉ một việc trước mắt.',
   500000, 60, 3);
