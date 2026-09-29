# Nguồn bộ tranh Tarot

78 lá trong thư mục này là bộ **Rider-Waite-Smith**, tranh do Pamela Colman Smith vẽ,
Rider & Company xuất bản lần đầu năm 1909.

## Bản dùng: lần in 1910, mẻ Pam A

| Mục | Nội dung |
|---|---|
| Bản in | 1910, mẻ Pam A — mẻ in sớm nhất, màu và nét sát bản gốc nhất |
| Độ phân giải gốc | khoảng **1144 × 1919** mỗi lá |
| Xuất ra | JPEG chất lượng 80, **600 × 1006**, khoảng 177 KB mỗi lá |
| Cả bộ trong app | 13,5 MB |
| Ngày xử lý | 2026-09-29 |

Lá to nhất trên màn hình là 210 điểm. Máy 3x cần 630 điểm ảnh, lấy 600 rồi để máy
phóng nhẹ thì mắt không phân biệt được mà nhẹ hơn khoảng 5 MB.

Bản gốc 1144 × 1919 vẫn giữ ở thư mục nguồn. Sau này cần in ấn hay làm ảnh quảng cáo
thì lấy từ đó, đừng phóng to file trong app.

## Thứ tự trong thư mục nguồn

Không có tên file, chỉ có số thứ tự, theo thứ tự bộ bài chuẩn:

```
00 – 21   22 lá Ẩn Chính, từ Gã Khờ tới Thế Giới
22 – 35   Gậy,   Át tới Vua
36 – 49   Cốc,   Át tới Vua
50 – 63   Kiếm,  Át tới Vua
64 – 77   Tiền,  Át tới Vua
```

Cách đổi tên xem `thay_anh_tarot.py`.

## Các bản khác đã có sẵn

Thư mục nguồn còn ba mẻ in khác, dùng được cả nếu muốn đổi màu:

| Mẻ in | Độ phân giải | Ghi chú |
|---|---|---|
| 1909 (Pam A) | 825 × 1429 | in sớm nhất nhưng quét thấp hơn, màu nhạt |
| **1910 (Pam A)** | **1144 × 1919** | **đang dùng** |
| 1920s (Pam B) | 1150 × 1920 | màu ngả cam hơn |
| 1920s – 1930s (Pam C) | 1136 × 1920 | gần giống Pam B |

## Về bản quyền

Pamela Colman Smith mất năm 1951. Việt Nam bảo hộ quyền tác giả suốt đời tác giả và
50 năm sau khi mất, nên bộ tranh đã hết thời hạn bảo hộ từ năm 2001. Ở các nước áp dụng
mức 70 năm, thời hạn cũng hết năm 2022.

Cả bốn mẻ ở đây đều in trước 1940, đều là bản in gốc chứ không phải bản tô màu lại của
nhà xuất bản hiện đại. **Giữ lại thư mục nguồn làm bằng chứng.**

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

## Nếu muốn app nhẹ hơn

13,5 MB ảnh là bình thường với app mà tranh chính là nội dung. Nếu sau này muốn cắt bớt
dung lượng tải về, có thể đưa ảnh lên kho lưu trữ của máy chủ rồi tải dần và giữ lại
trong máy. Đổi được tranh mà không phải phát hành lại app, nhưng lần mở đầu tiên phải
có mạng.
