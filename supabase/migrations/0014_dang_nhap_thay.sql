-- Nối một tài khoản đăng nhập với một hồ sơ thầy.
--
-- Để thầy tự xem đơn và tự đổi trạng thái ngay trong app, thay vì mở Supabase ra
-- sửa tay. Đồng thời là chỗ để biết đẩy thông báo tới máy nào khi có đơn mới.

-- Đặt vào bảng `lien_he_chuyen_gia` chứ KHÔNG đặt vào `chuyen_gia`.
--
-- Bảng `chuyen_gia` có luật "ai cũng đọc được" vì app cần hiện danh sách thầy
-- cho cả khách chưa đăng nhập. Hôm qua đã dính đúng chỗ này một lần với cột
-- email. Bảng liên hệ thì bật khoá dòng mà không khai luật nào, nên khoá công
-- khai đọc ra số không.
alter table lien_he_chuyen_gia add column tai_khoan uuid references auth.users(id) on delete set null;

-- Một tài khoản chỉ làm chủ một hồ sơ thầy.
create unique index lien_he_mot_tai_khoan_mot_thay
  on lien_he_chuyen_gia (tai_khoan) where tai_khoan is not null;

-- ---------------------------------------------------------------- hàm tra chủ

-- Luật khoá dòng bên dưới cần hỏi "tài khoản đang gọi có phải chủ hồ sơ thầy này
-- không". Nhưng bảng liên hệ đã khoá kín, nên câu hỏi phụ trong luật sẽ bị chính
-- khoá dòng chặn lại và luôn trả về sai.
--
-- `security definer` cho hàm chạy bằng quyền của người tạo bảng, đi xuyên qua
-- khoá dòng. Đây là khuôn mẫu chuẩn cho tình huống này.
--
-- `search_path` đặt rỗng và gọi tên bảng đầy đủ: hàm security definer mà để
-- search_path mở là ai đó tạo một bảng trùng tên ở lược đồ khác rồi chiếm quyền.
create or replace function la_chu_ho_so_thay(ma_thay text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.lien_he_chuyen_gia
     where chuyen_gia = ma_thay and tai_khoan = auth.uid()
  );
$$;

-- ---------------------------------------------------------------- luật cho thầy

-- Thầy đọc được đơn gửi cho chính mình. Khách vẫn chỉ đọc được đơn của khách —
-- luật cũ giữ nguyên, hai luật cùng loại thì Postgres lấy hợp của chúng.
create policy "thay doc don cua minh" on yeu_cau_tu_van for select
  using (la_chu_ho_so_thay(chuyen_gia));

-- Thầy đổi được trạng thái, nhưng KHÔNG lùi ngược về 'cho_nhan' và không sửa
-- được câu hỏi hay khung giờ — mấy thứ đó là lời của khách.
create policy "thay doi trang thai" on yeu_cau_tu_van for update
  using (la_chu_ho_so_thay(chuyen_gia))
  with check (
    la_chu_ho_so_thay(chuyen_gia)
    and trang_thai in ('da_nhan', 'da_xong', 'da_huy')
  );

-- ---------------------------------------------------------------- khai thầy

-- Tạo tài khoản cho thầy ở Authentication → Users → Add user, bật sẵn mục xác
-- nhận email, rồi chạy câu dưới đây với đúng địa chỉ vừa tạo.
--
--   update lien_he_chuyen_gia
--      set tai_khoan = (select id from auth.users where email = 'dia-chi-cua-thay')
--    where chuyen_gia = 'luna-chiem-tinh';
