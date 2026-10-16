-- Thầy có nhiều nơi để khách liên hệ, không chỉ Zalo.
--
-- Trước đây sau khi đặt lịch, app TỰ MỞ Zalo. Làm vậy là chọn hộ khách một
-- kênh, mà kênh đó có thể họ không dùng — và nó cũng đẩy khách ra khỏi app
-- ngay lúc vừa đặt xong, chưa kịp nhìn thấy đơn của mình nằm ở đâu.
--
-- Giờ khách tự chọn: đặt xong thì thấy danh sách nơi liên hệ của thầy, bấm cái
-- nào thì sang cái đó.
--
-- Mỗi nền tảng một cột, cố ý không gộp vào một ô jsonb: người sửa dữ liệu thầy
-- là người không viết code, mà sửa một ô text trong bảng thì dễ hơn gõ đúng
-- khuôn jsonb nhiều. Thêm nền tảng mới chỉ là thêm một cột.

alter table chuyen_gia rename column trang_ca_nhan to tiktok;
alter table chuyen_gia add column facebook text;

comment on column chuyen_gia.tiktok   is 'Duong dan day du, vi du https://www.tiktok.com/@...';
comment on column chuyen_gia.facebook is 'Duong dan day du toi trang Facebook';
comment on column chuyen_gia.zalo     is 'So dien thoai Zalo, chi so, khong co https';
