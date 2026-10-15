-- Chép tên khách vào đơn, để thầy biết mình đang nói chuyện với ai.
--
-- Đơn hiện chỉ mang `nguoi_dung` là một mã định danh. Thầy mở danh sách ra chỉ
-- thấy một dãy ký tự vô nghĩa — không xưng hô được, không sắp xếp hay tìm theo
-- tên được.
--
-- VÌ SAO CHÉP SANG CHỨ KHÔNG NỐI SANG BẢNG HỒ SƠ
--
-- Cách kia là mở luật khoá dòng cho thầy đọc bảng `ho_so` của những khách đã
-- đặt mình. Nhưng bảng đó chứa cả ngày sinh, giờ sinh, nơi sinh, giới tính —
-- mở ra là thầy thấy hết, trong khi việc đang cần chỉ là một cái tên.
--
-- Chép một ô tại lúc đặt thì thầy có đúng thứ cần, không hơn. Khách đổi tên về
-- sau cũng không làm đổi tên trên đơn cũ, và như vậy mới đúng: đơn là ảnh chụp
-- của lúc đặt.
--
-- Thầy cần thêm ngày sinh để luận giải thì thêm một cột nữa theo đúng cách này,
-- đừng mở luật đọc cả bảng.

alter table yeu_cau_tu_van add column ten_khach text;

comment on column yeu_cau_tu_van.ten_khach is
  'Ảnh chụp tên khách lúc đặt. Khách đổi tên sau không làm đổi ô này.';
