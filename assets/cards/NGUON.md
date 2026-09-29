# Nguồn bộ tranh Tarot

78 lá trong thư mục này là bộ **Rider-Waite-Smith**, tranh do Pamela Colman Smith vẽ,
Rider & Company xuất bản lần đầu năm 1909.

## Lấy từ đâu

| Mục | Nội dung |
|---|---|
| File gốc | `A-Printable-Rider-Waite-Tarot-Deck.pdf` (tài liệu in sẵn, 9 trang, lưới 3×3) |
| Ngày xử lý | 2026-09-29 |
| Cách cắt | Dò lưới rồi cắt tự động, xem `cat_tarot.py` và `dat_ten_tarot.py` |
| Độ phân giải gốc | ảnh nhúng trong PDF khoảng 1414×1982 mỗi trang, tức **~260×455 mỗi lá** |
| Xuất ra | JPEG chất lượng 88, 313×542, khoảng 40 KB mỗi lá |

## Về bản quyền

Pamela Colman Smith mất năm 1951. Việt Nam bảo hộ quyền tác giả suốt đời tác giả và
50 năm sau khi mất, nên bộ tranh đã hết thời hạn bảo hộ từ năm 2001. Ở phần lớn các
nước khác áp dụng mức 70 năm, thời hạn cũng đã hết năm 2022.

**Cần lưu ý một chỗ.** Một số nhà xuất bản có bán các bản **tô màu lại** của bộ này và
giữ bản quyền riêng cho phần tô màu đó. Bản trong thư mục này có màu phẳng và rực theo
lối in cũ, đúng kiểu các bản in đầu, không phải bản tô lại hiện đại. Dù vậy, trước khi
phát hành nên:

- Giữ lại file PDF gốc làm bằng chứng
- Đối chiếu thêm với một bản quét có ghi rõ xuất xứ từ kho lưu trữ công khai
- Nếu thay bằng bộ ảnh khác thì cập nhật lại bảng trên

## Quy ước đặt tên

Trùng với cột `ma` trong `data/tarot_78_la.csv`:

```
major-00.jpg … major-21.jpg     22 lá Ẩn Chính
cups-01.jpg  … cups-14.jpg      Cốc
wands-01.jpg … wands-14.jpg     Gậy
swords-01.jpg … swords-14.jpg   Kiếm
pents-01.jpg … pents-14.jpg     Tiền
```

Với bộ số: `01` là Át, `02` tới `10` là các số, `11` Tiểu Đồng, `12` Hiệp Sĩ,
`13` Hoàng Hậu, `14` Vua.

## Chất lượng

Ảnh gốc chỉ khoảng 260×455 nên khi phóng to hết màn hình sẽ hơi mờ. Đủ dùng để dựng và
để chạy thử. Trước khi nộp chợ nên tìm bản quét nét hơn, tối thiểu 600×1050 mỗi lá.
