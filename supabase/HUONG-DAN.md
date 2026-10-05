# Dựng cơ sở dữ liệu

Làm một lần, khoảng 20 phút. Không cần tài khoản chợ nào.

---

## 1. Tạo dự án

Vào **supabase.com**, đăng ký rồi bấm **New project**.

| Ô | Điền gì |
|---|---|
| Name | `app-huyen-hoc` |

> App đã đổi tên thành **Omora** ngày 2026-10-01, nhưng dự án trên
> Supabase vẫn giữ tên cũ. Đổi tên ở đó chỉ là chuyện hiển thị, không ảnh
> hưởng gì tới khoá hay đường dẫn, nên để nguyên cũng được.
| Database Password | Một mật khẩu dài. **Lưu lại ngay**, sau này không xem lại được |
| Region | **Singapore** — gần Việt Nam nhất, mỗi lượt gọi nhanh hơn khoảng 150 mili giây so với Mỹ |
| Plan | Free |

Chờ khoảng hai phút cho máy chủ dựng xong.

---

## 2. Bật đăng nhập ẩn danh

**Authentication → Sign In / Providers → Anonymous Sign-Ins → bật.**

Không bật thì app không tạo được hồ sơ, khách mở lên là màn trắng. Đây là chỗ hay quên nhất.

---

## 3. Tạo bảng

**SQL Editor → New query**, dán toàn bộ nội dung `supabase/migrations/0001_khoi_tao.sql` rồi bấm **Run**.

Xong thì vào **Table Editor**, phải thấy tám bảng: `la_bai`, `so_chu_dao`, `so_van_menh`,
`cung_hoang_dao`, `do_hop_cung`, `ho_so`, `lan_rut`, `su_kien`.

Cả tám đều phải hiện nhãn **RLS enabled**. Bảng nào không có nhãn đó là dừng lại, chạy lại file.

---

## 4. Lấy hai bộ khoá

**Project Settings → API**. Có hai khoá, đừng nhầm.

| Khoá | Dùng ở đâu | Lộ ra ngoài được không |
|---|---|---|
| `anon` `public` | Trong app | Được, vì đã có khoá dòng dữ liệu chặn |
| `service_role` `secret` | Chỉ hai lệnh ở máy | **Không bao giờ.** Nó bỏ qua mọi lớp bảo vệ |

Tạo hai file ở thư mục gốc dự án:

```bash
# .env  — khoá app dùng
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_ZALO_CONG_TY=
EXPO_PUBLIC_XEM_THU=

# .env.quan-tri  — chỉ để nạp dữ liệu, không vào app
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

Cả hai đã nằm trong `.gitignore`.

**Để trống `EXPO_PUBLIC_XEM_THU`** thì app mới chạy bằng dữ liệu thật. Điền `1` là quay lại
chế độ xem thử dùng nội dung đóng sẵn.

---

## 5. Nạp nội dung

```bash
npm run nap-du-lieu
```

Phải ra:

```
OK    la_bai           nạp 78 dòng, bảng đang có 78
OK    so_chu_dao       nạp 12 dòng, bảng đang có 12
OK    so_van_menh      nạp 12 dòng, bảng đang có 12
OK    cung_hoang_dao   nạp 12 dòng, bảng đang có 12
OK    do_hop_cung      nạp 78 dòng, bảng đang có 78
```

Chạy lại nhiều lần được, dòng cũ bị ghi đè chứ không nhân đôi.

Rồi soát nội dung đã lên đúng chưa:

```bash
npm run soat-du-lieu
```

Lệnh này đối chiếu từng chữ với file CSV, không chỉ đếm số dòng. Đếm đủ mà dấu tiếng Việt
hỏng hoặc ô dài bị cắt cụt thì vẫn là sai.

---

## 6. Kiểm khoá dòng dữ liệu

**Bước này không được bỏ.**

```bash
npm run kiem-khoa
```

Lệnh này dùng đúng khoá công khai mà app dùng, rồi thử tám việc:

- Đọc được năm bảng nội dung
- **Không** ghi được vào bảng nội dung
- **Không** đọc được `ho_so`, `lan_rut`, `su_kien` của người khác
- Đăng nhập ẩn danh rồi chỉ thấy đúng dòng của mình
- **Không** ghi được hồ sơ mang tên người khác

Rồi thử trọn đường lưu hồ sơ, đúng như app làm khi khách nhập xong năm bước:

```bash
npm run thu-ho-so
```

Lệnh này đăng nhập, lưu hồ sơ, sửa, rút bài, ghi sự kiện rồi xoá sạch. Kiểm từng cột
riêng lẻ chưa đủ — phải chạy thật một lượt mới biết đường đi có thông không.

Phải ra `KHOÁ DÒNG DỮ LIỆU ĂN ĐÚNG` và `ĐƯỜNG LƯU HỒ SƠ THÔNG SUỐT`. Còn chỗ nào `SAI` thì sửa xong mới được phát hành —
đây là lỗ hổng làm lộ họ tên và ngày sinh của toàn bộ khách.

---

## 7. Chạy thử

```bash
npx expo start
```

Bấm `w` mở trình duyệt, hoặc quét mã bằng **Expo Go** trên điện thoại thật.

Lần mở đầu app tự tạo hồ sơ ẩn danh rồi vào luồng nhập hồ sơ năm bước. Nhập xong, vào
**Table Editor → ho_so** phải thấy đúng một dòng vừa tạo.

---

## Gặp lỗi thì xem đây

| Hiện tượng | Nguyên nhân |
|---|---|
| Màn "Chưa nối được máy chủ" | Sai URL hoặc khoá trong `.env`. Khởi động lại `expo start` sau khi sửa |
| `Anonymous sign-ins are disabled` | Chưa làm bước 2 |
| Nạp dữ liệu báo `relation does not exist` | Chưa chạy file ở bước 3 |
| Nạp dữ liệu báo `new row violates row-level security` | Đang dùng khoá `anon` thay vì `service_role` trong `.env.quan-tri` |
| App mở lên vẫn thấy hồ sơ Nguyễn Thị Ánh Đào | `EXPO_PUBLIC_XEM_THU` còn bằng `1`, xoá đi |
| Kiểm khoá báo đọc được `ho_so` | Bảng chưa bật khoá dòng. Chạy lại file ở bước 3 |

---

## Sau đó

Phần miễn phí của Supabase đủ cho giai đoạn đầu: 500 MB dữ liệu, 50 nghìn người dùng mỗi
tháng. Khi đông hơn thì lên gói trả phí khoảng 650 nghìn một tháng, đã tính trong bảng chi phí.

**Dự án miễn phí bị tạm dừng nếu bỏ không một tuần.** Trong lúc đang làm thì không sao, nhưng
nếu nghỉ dài thì nhớ mở app một lần cho nó chạy lại.
