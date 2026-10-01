-- Thêm cột nơi sinh vào bảng hồ sơ.
--
-- File 0001 sót cột này, trong khi bước 4 của phần nhập hồ sơ có hỏi và app có ghi.
-- Thiếu nó thì mọi lần lưu hồ sơ đều hỏng, app báo "Chưa lưu được hồ sơ".

alter table ho_so add column if not exists noi_sinh text;
