-- Cho phép người dùng tự xoá lịch sử rút bài và sự kiện của chính mình.
--
-- File 0001 cho hai bảng này tham chiếu auth.users chứ không phải ho_so, nên xoá
-- dòng hồ sơ thì chúng vẫn nằm lại. Mà app chỉ xoá được dòng hồ sơ, không xoá được
-- tài khoản — việc đó cần khoá quản trị, không bao giờ để trong app.
--
-- Kết quả: mục "Xoá toàn bộ dữ liệu của tôi" chưa xoá hết. Đây là thứ cả hai chợ
-- và Nghị định 13 đều bắt buộc làm đúng.

create policy "xoa lan rut cua minh" on lan_rut
  for delete using (auth.uid() = nguoi_dung);

create policy "xoa su kien cua minh" on su_kien
  for delete using (auth.uid() = nguoi_dung);
