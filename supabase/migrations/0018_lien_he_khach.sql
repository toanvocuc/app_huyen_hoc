-- Khách khai một đường liên lạc, và thầy xem được hồ sơ của khách đã đặt mình.
--
-- VÌ SAO CẦN
--
-- Luồng cũ dựa hẳn vào việc khách tự mở Zalo sau khi gửi đơn. Khách bấm gửi rồi
-- tắt app ở đó là thầy có đơn mà KHÔNG CÓ ĐƯỜNG NÀO với tới: không số điện
-- thoại, không Zalo, không gì. Đơn thành thư chết.

-- Số điện thoại hoặc đường dẫn Zalo. Để trong hồ sơ khách chứ không chép sang
-- đơn: khách đổi số thì thầy phải thấy số mới, kể cả với đơn đặt từ tuần trước.
alter table ho_so add column lien_he text;

comment on column ho_so.lien_he is
  'So dien thoai hoac link Zalo. Chi hoi khi khach dat lich lan dau.';

-- ---------------------------------------------------------------- thầy xem hồ sơ khách

-- Thầy đọc được hồ sơ của khách ĐÃ ĐẶT MÌNH, không đọc được của ai khác.
--
-- Trước đây tôi chép tên khách sang đơn để tránh mở bảng này ra. Giờ thầy cần
-- thêm ngày sinh, giờ sinh và đường liên lạc — chép bốn năm ô sang đơn thì vừa
-- trùng lặp vừa sai: khách sửa lại giờ sinh cho đúng mà đơn vẫn giữ giờ cũ, rồi
-- thầy luận giải theo số sai.
--
-- Câu hỏi phụ bên dưới chạy dưới quyền của chính người gọi, nên khoá dòng của
-- bảng `yeu_cau_tu_van` vẫn áp vào nó. Nghĩa là nó chỉ thấy những đơn mà thầy
-- đó vốn đã đọc được — phạm vi tự thu hẹp đúng chỗ, không cần kiểm thêm.
create policy "thay doc ho so khach da dat minh" on ho_so for select
  using (
    exists (
      select 1 from yeu_cau_tu_van y
       where y.nguoi_dung = ho_so.nguoi_dung
         and la_chu_ho_so_thay(y.chuyen_gia)
    )
  );
