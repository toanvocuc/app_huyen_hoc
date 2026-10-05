-- Độ hợp cung hoàng đạo: mỗi cặp một bài riêng thay vì dùng chung bốn câu.
--
-- Bảng cũ chỉ có `loi_binh`, mà nội dung của nó lại lấy theo điểm, nên cả 78 cặp
-- chỉ xoay quanh bốn câu. Khách xem hai cặp khác nhau là nhận ra ngay.
-- Ba cột mới dưới đây viết riêng cho từng cặp.
--
-- Thang điểm cũng dựng lại. Bản cũ chấm theo nguyên tố nên dồn 73% số cặp vào
-- hai đầu 2 sao và 5 sao, còn mức 1 sao thì không cặp nào chạm tới. Bản mới chấm
-- theo góc chiếu giữa hai cung và cho ra 12 / 12 / 18 / 24 / 12 cặp cho mức 1 tới 5.
-- Điểm nằm trong file CSV nên chạy lại `npm run nap-du-lieu` là cập nhật theo.

alter table do_hop_cung add column if not exists diem_manh  text;
alter table do_hop_cung add column if not exists diem_yeu   text;
alter table do_hop_cung add column if not exists loi_khuyen text;

-- Để cho phép null: dòng cũ trong bảng chưa có ba cột này. Nạp dữ liệu xong thì
-- mọi dòng đều đủ, nhưng không đặt not null để lần nạp sau không bị chặn giữa chừng.

-- Khoá dòng đã bật sẵn từ file 0001 và luật "ai cũng đọc được" vẫn áp cho cột mới,
-- nên ở đây không phải khai báo lại gì.
