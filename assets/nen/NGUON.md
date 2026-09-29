# Nguồn ảnh nền và ảnh trang trí

| File | Kích thước | Dùng ở đâu |
|---|---|---|
| `ngan-ha.jpg` | 1170 × 779 | Nền màn chào mừng và màn chúc mừng |
| `vong-hoang-dao.jpg` | 720 × 720 | Bước nhập ngày sinh, và màn Khám phá |
| `dong-ho-cat.jpg` | 270 × 380 | Bước nhập giờ sinh |
| `sao-doc.jpg` | 780 × 1389 | Nền sáu màn nhập hồ sơ |
| `khung-hoa-van.jpg` | 840 × 1260 | Nền ba màn Tarot |
| `../cards/mat-sau.jpg` | 600 × 1053 | Mặt sau lá bài |

Sáu ảnh do công ty cấp ngày 2026-09-29.

## Cần làm rõ trước khi phát hành

**Xin công ty xác nhận nguồn và giấy phép của sáu ảnh này**, rồi ghi vào bảng trên:
lấy từ đâu, mua ở đâu, hay tự tạo. Cả hai chợ đều không kiểm ảnh, nhưng chủ sở hữu
ảnh vẫn có thể khiếu nại sau khi app đã lên.

Riêng `ngan-ha.jpg` trông giống ảnh chụp thật của nhiếp ảnh gia, loại hay bán trên các
sàn ảnh. Đây là ảnh rủi ro nhất trong ba ảnh vì nó là thứ đầu tiên khách nhìn thấy.

## Về chất lượng

`dong-ho-cat.jpg` chỉ 270 × 380 nên hiện ở cỡ 150 điểm là vừa. Phóng lớn hơn sẽ mờ.
Nếu xin được bản to hơn thì thay vào, không cần sửa code.

`ngan-ha.jpg` là ảnh ngang. Màn hình dọc nên chỉ dùng phần trên rồi tan dần vào nền,
xem `src/components/nen-sao.tsx`. Nếu có bản dọc thì đổi cách đặt sẽ đẹp hơn nữa.

## Ghi chú thêm

`sao-doc.jpg` gốc chỉ 415 × 739, đã phóng lên 780 × 1389. Ảnh mờ sẵn nên phóng lên
không lộ, nhưng có bản to hơn thì vẫn nên thay.

`mat-sau.jpg` gốc là 976 × 1612, tỷ lệ 0,605. Đã cắt bớt trên dưới đều nhau để về đúng
tỷ lệ 0,57 của bộ Rider-Waite, nhờ vậy mặt trước mặt sau cùng khung.
