-- Thầy dọn đơn đã khép lại khỏi danh sách của mình.
--
-- ───────────────────────────────────────────────────────────── VÌ SAO CẦN FILE NÀY
--
-- Màn của thầy đổ hết mọi đơn từ trước tới nay vào một danh sách, và nút Đăng
-- xuất nằm dưới cùng. Vài chục đơn là thầy phải vuốt mỏi tay mới tới được nút
-- đó, mà phần lớn số đơn ấy đã xong hoặc đã huỷ từ lâu — không còn việc gì.
--
-- ─────────────────────────────────────────────────────── VÌ SAO ẨN CHỨ KHÔNG XOÁ
--
-- Cùng một dòng này là lịch sử của KHÁCH nữa. Thầy bấm dọn mà xoá thật thì buổi
-- tư vấn khách đã trả tiền biến mất khỏi máy khách, kèm cả lý do thầy viết lúc
-- từ chối. Khách không làm gì sai và cũng không được hỏi.
--
-- Nên thêm một ô riêng của thầy. Dọn là ẩn khỏi màn thầy; bên khách không đổi
-- một chữ nào.
--
-- Không làm nút "hiện lại": thầy dọn một đơn đã xong là dọn hẳn, và một màn
-- thùng rác cho thứ không ai lấy lại chỉ thêm một chỗ để lạc.

alter table yeu_cau_tu_van
  add column if not exists thay_an boolean not null default false;

comment on column yeu_cau_tu_van.thay_an is
  'Thầy đã dọn đơn này khỏi danh sách của mình. Không ảnh hưởng gì tới phía khách.';

-- Khách không được đụng vào ô này.
--
-- Luật "tu huy khi thay chua nhan" chỉ xét `trang_thai`, nên khách gửi kèm
-- `thay_an: true` trong cùng lệnh huỷ là trót lọt — đơn biến mất khỏi màn thầy
-- mà thầy không hề bấm gì. Chặn ngay trong trigger đang có, cùng chỗ với mấy ô
-- khác đã được kẹp theo cả hai chiều.
create or replace function giu_loi_cua_khach() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Không có người gọi cụ thể: khoá quản trị hoặc hàm trong máy chủ. Để yên.
  if auth.uid() is null then
    return new;
  end if;

  if auth.uid() <> old.nguoi_dung then
    -- Người gọi KHÔNG phải chủ đơn, tức là thầy. Thầy chỉ được đụng vào
    -- `trang_thai`, `ly_do` và `thay_an`; mọi ô còn lại là lời của khách.
    new.nguoi_dung := old.nguoi_dung;
    new.chuyen_gia := old.chuyen_gia;
    new.chu_de     := old.chu_de;
    new.khung_gio  := old.khung_gio;
    new.gio_hen    := old.gio_hen;
    new.ngay_hen   := old.ngay_hen;
    new.cau_hoi    := old.cau_hoi;
    new.ten_khach  := old.ten_khach;
    new.tao_luc    := old.tao_luc;
    new.goi        := old.goi;
    new.gia_goi    := old.gia_goi;
  else
    -- Chính khách. Khách không được viết hộ lý do từ chối của thầy, cũng không
    -- được tự dọn đơn khỏi danh sách của thầy.
    new.ly_do  := old.ly_do;
    new.thay_an := old.thay_an;
  end if;

  return new;
end $$;

-- Danh sách của thầy lọc theo ô này, nên cho nó vào chỉ mục luôn.
create index if not exists don_thay_chua_don
  on yeu_cau_tu_van (chuyen_gia, thay_an, tao_luc desc);
