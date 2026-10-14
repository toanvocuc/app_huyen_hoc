-- Hai cột mới cho hồ sơ thầy, và một chỗ ghi lại mỗi lần báo tin.

-- Email để nhận thư báo có đơn mới.
--
-- CỐ Ý KHÔNG để trong data/chuyen_gia.csv như mấy cột khác: repo này công khai
-- trên GitHub, mà địa chỉ email cá nhân nằm trong repo công khai là robot thu
-- thập quét được vĩnh viễn. Cột này chỉ điền thẳng dưới Supabase.
alter table chuyen_gia add column email text;

-- Trang cá nhân công khai của thầy. Người xem muốn biết thầy có thật hay không,
-- và một kênh có người theo dõi là bằng chứng mạnh hơn mọi lời tự giới thiệu.
alter table chuyen_gia add column trang_ca_nhan text;

-- ---------------------------------------------------------------- nhật ký báo tin

-- Ghi lại mỗi lần gửi thư, để khi thầy nói "tôi không nhận được gì" thì còn chỗ
-- tra. Thiếu bảng này thì hỏng ở đâu cũng chỉ đoán.
create table nhat_ky_bao_tin (
  ma        uuid primary key default gen_random_uuid(),
  yeu_cau   uuid references yeu_cau_tu_van(ma) on delete set null,
  gui_toi   text not null,
  thanh_cong boolean not null,
  loi       text,
  tao_luc   timestamptz not null default now()
);

alter table nhat_ky_bao_tin enable row level security;

-- Không có luật nào cho khách: bảng này chỉ hàm chạy bằng khoá quản trị mới đụng
-- tới. Bật khoá dòng mà không khai luật nghĩa là khoá công khai không đọc được
-- dòng nào — đúng ý muốn.
