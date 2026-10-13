-- Hồ sơ thầy tư vấn.
--
-- Để trong bảng chứ KHÔNG để trong app. Thầy đổi giá, đổi giờ làm việc, hay nghỉ
-- một tuần thì sửa một dòng ở đây là khách thấy ngay. Nhét vào mã nguồn là mỗi
-- lần đổi giá phải đóng gói lại và chờ hai chợ duyệt.
--
-- Dựng cho nhiều thầy ngay từ đầu dù hiện mới có một. Thêm thầy thứ hai sau này
-- chỉ là thêm một dòng; sửa bảng một cột khi đã có dữ liệu thật thì phiền hơn
-- nhiều.

create table chuyen_gia (
  ma   text primary key,
  ten  text not null,

  -- Đường dẫn ảnh chân dung. Để trống thì app vẽ biểu tượng thay thế, không vỡ.
  -- Dùng đường dẫn chứ không nhúng ảnh vào app, vì ảnh cũng phải đổi được mà
  -- không cần đóng gói lại.
  anh  text,

  -- Phần nghề nghiệp, thứ khách nhìn vào để quyết định có tin hay không.
  nam_kinh_nghiem  int,
  chuyen_sau       text,          -- 'Tarot, Tử vi' — ngăn bằng dấu phẩy
  hoc_tu           text,          -- trường phái, thầy truyền dạy
  so_nguoi_da_xem  int,

  -- Lời tự giới thiệu, PHẢI do chính thầy viết. Viết hộ là ra giọng quảng cáo,
  -- khách nhận ra ngay và mất tin.
  gioi_thieu text not null,

  -- Phần khách cần để bấm. Thiếu giá là khách không dám nhắn — đây là chỗ hỏng
  -- phổ biến nhất của mấy app kiểu này.
  gia_tu            int,           -- đồng, một lượt
  gom_gi            text,          -- 'Nhắn tin 30 phút, có gửi lại bản ghi'
  thoi_gian_tra_loi text,          -- 'Thường trong 2 tiếng'
  gio_lam_viec      text,          -- '9h tới 21h, nghỉ chủ nhật'

  -- Số Zalo riêng của từng thầy. Trước đây số nằm trong biến môi trường của app,
  -- nên đổi số là phải đóng gói lại và người chưa cập nhật vẫn nhắn vào số cũ.
  zalo text,

  -- Tắt khi thầy nghỉ dài ngày: hồ sơ vẫn xem được nhưng không mời nhắn nữa.
  dang_nhan boolean not null default true,
  thu_tu    int     not null default 0
);

create index chuyen_gia_thu_tu_idx on chuyen_gia (dang_nhan, thu_tu);

-- Khoá dòng bật ngay tại đây, cùng file với lệnh tạo bảng.
alter table chuyen_gia enable row level security;
create policy "ai cung doc duoc" on chuyen_gia for select using (true);
