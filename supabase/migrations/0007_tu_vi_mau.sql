-- Tử vi hằng ngày và hằng tuần theo cung hoàng đạo (E02, E03).
--
-- Không gọi AI mỗi lượt khách xem. Bài viết sẵn thành kho, app chọn theo ngày
-- hoặc theo tuần, nên tiền máy chủ cố định chứ không tăng theo số người dùng.
-- Đây là lưu ý số 6 của Phase 1 trong kế hoạch.
--
-- Mỗi mục có một kho riêng và số lượng trong mỗi kho CỐ Ý khác nhau, nên tổ hợp
-- bốn mục gần như không lặp lại: bản ngày lặp sau hơn 5000 ngày, bản tuần sau
-- hơn 160 tuần. Kho nào cũng bằng nhau thì chỉ sau mươi ngày là khách thấy lại
-- nguyên một bài cũ.

create table tu_vi_mau (
  ky       text not null check (ky in ('ngay', 'tuan')),
  muc      text not null check (muc in ('tong_quan', 'tinh_cam', 'cong_viec', 'suc_khoe')),
  -- Mã cung, hoặc 'chung' nếu bài dùng được cho mọi cung. Dùng chữ 'chung' chứ
  -- không để ô trống, vì Postgres không cho ô trống nằm trong khoá chính.
  cung     text not null,
  thu_tu   int  not null,
  noi_dung text not null,
  primary key (ky, muc, cung, thu_tu)
);

create index tu_vi_mau_tra_cuu_idx on tu_vi_mau (ky, muc, cung);

-- Khoá dòng bật ngay tại đây, cùng file với lệnh tạo bảng.
alter table tu_vi_mau enable row level security;
create policy "ai cung doc duoc" on tu_vi_mau for select using (true);
