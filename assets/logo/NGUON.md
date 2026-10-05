# Logo Omora

| File | Kích thước | Dùng ở đâu |
|---|---|---|
| `omora-day-du.png` | 612 × 768 | Màn chào mừng, thẻ chia sẻ |
| `omora-dau.png` | 600 × 662 | Bản chỉ còn hình, chưa dùng tới |
| `omora-vuong.png` | 1024 × 1024 | Bản vuông, để dành làm biểu tượng app |

Công ty gửi ngày 2026-10-01, một file PNG 641 × 519.

## Ba chỗ phải sửa trước khi dùng được

Ảnh gốc là nét **nâu trên nền xám có kẻ ô**, và có chữ **SLOGAN HERE** là chữ giữ chỗ
của mẫu thiết kế. Bản trong app đã xử lý:

1. **Tách nét khỏi nền và khỏi lưới kẻ ô.** Nét vẽ ngả nâu còn lưới là xám trung tính,
   nên lọc theo chênh lệch giữa kênh đỏ và kênh xanh là tách sạch.
2. **Bỏ chữ SLOGAN HERE.** Gắn nhãn từng mảng nét rời rồi bỏ những mảng nằm ngoài khung
   bầu dục và ở nửa dưới. Chữ OMORA cũng nằm ngoài khung nhưng ở nửa trên nên giữ lại.
3. **Đổi nét sang màu vàng `#D4A84B`**, nền để trong suốt.

Script dựng nằm ở `scratchpad/lam_logo.py` của phiên làm việc. Có logo mới thì chạy lại
script đó, hoặc xin công ty bản vector.

## Còn thiếu

**Xin công ty xác nhận nguồn và giấy phép.** Mẫu có chữ SLOGAN HERE là dấu hiệu của
ảnh mua từ sàn mẫu thiết kế, loại thường kèm điều kiện sử dụng riêng.

Biểu tượng app đã dựng từ logo này, bằng `python scripts/lam-bieu-tuong.py`. Có logo
mới thì thay `omora-vuong.png` rồi chạy lại lệnh đó, đừng sửa tay từng file trong
`assets/images/` vì sáu file đó phải khớp nhau.

Thư mục `assets/expo.icon` không còn được dùng tới — đó là biểu tượng xanh mặc định của
Expo, đã gỡ khỏi `app.json`. Xoá đi được.
