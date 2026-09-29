# [App huyền học]

> Ứng dụng tử vi cho người Việt: rút bài Tarot, chiêm tinh phương Tây và thần số học.
> Một bộ mã nguồn chạy trên cả Android và iOS.

Khách tải app về là dùng được ngay, không cần đăng ký. App tự tạo một hồ sơ ẩn danh,
hỏi ngày sinh, rồi đưa thẳng vào nội dung. Mỗi sáng gửi một lá bài của ngày hôm đó.

---

## Tính năng bản đầu

- **Rút bài Tarot** — bộ 78 lá Rider-Waite, trải một lá hoặc ba lá, có nghĩa xuôi và nghĩa ngược
- **Lá bài hôm nay** — mỗi ngày một lá cố định theo từng người, gửi kèm thông báo buổi sáng
- **Chiêm tinh phương Tây** — xác định cung từ ngày sinh, tính cách từng cung, độ hợp giữa hai cung
- **Thần số học** — số chủ đạo từ ngày sinh, số vận mệnh từ họ tên
- **Chia sẻ** — lưu kết quả thành ảnh để đăng mạng xã hội
- **Hồ sơ ẩn danh** — không có màn hình đăng nhập, dữ liệu gắn với mã thiết bị

---

## Công nghệ

| Phần | Dùng gì |
|---|---|
| App | Expo (React Native) + TypeScript |
| Giao diện | NativeWind |
| Điều hướng | Expo Router |
| Cơ sở dữ liệu, đăng nhập, lưu ảnh | Supabase |
| Logic chạy ngầm | Supabase Edge Functions |
| Gọi AI | Claude API |
| Thông báo đẩy | Expo Notifications |
| Đóng gói | EAS Build + EAS Submit |
| Bắt lỗi | Sentry |

Không cần máy Mac để ra bản iOS — EAS Build đóng gói trên máy chủ.

---

## Chạy thử tại máy

```bash
npm install
cp .env.example .env        # rồi điền khoá vào .env
npm run kiem-tra            # kiểm phần tính toán, chạy trong 1 giây
npx expo start
```

| Lệnh | Làm gì |
|---|---|
| `npm run kiem-tra` | Kiểm số chủ đạo, số vận mệnh, bỏ dấu tiếng Việt, xác định cung |
| `npm run typecheck` | Soát kiểu TypeScript |
| `npx expo start` | Chạy thử |
| `npx expo export --platform android` | Thử đóng gói, xem có lỗi biên dịch không |

Muốn chạy trên máy ảo Android thì cài Android Studio để lấy bộ công cụ và máy ảo.
Chạy trên iPhone thật thì dùng Expo Go, hoặc dựng bản qua EAS.

### Biến môi trường

| Tên | Dùng ở đâu | Ghi chú |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | app | công khai được |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | app | công khai được, **luôn đi kèm khoá dòng dữ liệu** |
| `SUPABASE_SERVICE_ROLE_KEY` | chỉ Edge Function | **không bao giờ đưa vào app** |
| `ANTHROPIC_API_KEY` | chỉ Edge Function | **không bao giờ đưa vào app** |

`.env` nằm trong `.gitignore`. Đừng gỡ nó ra.

---

## Cấu trúc thư mục

```
src/
  app/            màn hình, đi theo Expo Router
    (tabs)/         bốn thẻ: Hôm nay · Rút bài · Khám phá · Cá nhân
  components/     thành phần giao diện dùng lại
  lib/            gọi Supabase và các hàm tính toán
    tarot.ts        rút bài, chọn lá của ngày
    numerology.ts   số chủ đạo, số vận mệnh, bỏ dấu tiếng Việt
    zodiac.ts       xác định cung, tính độ hợp
    supabase.ts     nối máy chủ, đăng nhập ẩn danh
    su-kien.ts      ghi ba mốc đếm phễu, sinh mã theo dõi
    kho-noi-dung.ts đọc nội dung từ cơ sở dữ liệu
assets/
  cards/          78 ảnh Tarot, bản quét in năm 1909 (xem NGUON.md)
supabase/
  migrations/     mọi thay đổi cấu trúc bảng, theo thứ tự
  functions/      Edge Functions, chỗ duy nhất giữ khoá bí mật
data/             nội dung dạng CSV để nạp vào cơ sở dữ liệu
kiem-tra/         kiểm nhanh phần tính toán, không cần máy ảo
```

---

## Quy ước phải giữ

Mấy điều dưới đây không phải sở thích. Vi phạm là sinh lỗi mất dữ liệu hoặc lệch tiền.

### Bảo mật

- **Bật khoá dòng dữ liệu ngay lúc tạo bảng**, trước khi viết code đụng vào nó.
  Bảng chưa bật khoá là bảng ai cũng đọc được toàn bộ, vì khoá công khai nằm sẵn trong app.
- **Gặp lỗi không có quyền thì sửa luật khoá dòng, đừng đổi sang khoá quản trị.**
  Đổi khoá cho hết báo lỗi là gỡ luôn lớp bảo vệ.
- **Không gọi Claude API thẳng từ app.** Mọi lệnh gọi đi qua Edge Function,
  và có trần chi tiêu theo ngày.

### Tiền

- Tiền là **số nguyên**, đơn vị đồng. Không dùng số thực.
- Sổ tiền **chỉ ghi thêm dòng**, không sửa dòng cũ. Số dư là tổng các dòng.
- Cộng trừ số dư làm **trong cơ sở dữ liệu**, không đọc ra rồi ghi ngược lại từ app.
- Mỗi giao dịch có **mã riêng không trùng**, để gửi lại lần hai không bị trừ tiền hai lần.
- Đồng hồ tính theo phút **chạy ở máy chủ**. App chỉ hiển thị.

### Cơ sở dữ liệu

- Mọi thay đổi cấu trúc bảng đều thành **file trong `supabase/migrations/`**.
  Đổi bảng bằng cách bấm trong trang quản trị thì vài tuần sau không ai dựng lại được.

---

## Nội dung

Nội dung nằm trong `data/`, dạng CSV, nạp vào cơ sở dữ liệu lúc dựng:

| File | Số dòng |
|---|---|
| `tarot_78_la.csv` | 78 |
| `so_chu_dao.csv` | 12 |
| `so_van_menh.csv` | 12 |
| `cung_hoang_dao.csv` | 12 |
| `do_hop_cung.csv` | 78 |
| `quy_doi_chu_cai.csv` | 26 |

### Về bộ tranh Tarot

Ảnh trong `assets/cards/` là **bản quét từ bản in Rider-Waite năm 1909**, đã hết hạn
bản quyền.

Chỉ dùng bản quét từ bản in gốc. **Không lấy các bản tô màu lại hay vẽ lại sau này** —
những bản đó vẫn còn bản quyền riêng. Nguồn tải và ngày tải lưu trong
`assets/cards/NGUON.md`.

### Về tên tiếng Việt

Số vận mệnh tính từ họ tên nên phải bỏ dấu trước. Chỗ hay sai nhất:
**`Đ` phải chuyển thành `D`, không được bỏ đi.** Bỏ nhầm là cả cái tên ra sai số.

Số chủ 11, 22, 33 **giữ nguyên, không cộng dồn tiếp**.

---

## Lộ trình

| Giai đoạn | Nội dung |
|---|---|
| 1 | Tarot, chiêm tinh, thần số học. Miễn phí, hồ sơ ẩn danh, lên hai chợ |
| 2 | Lá số Tử Vi, luận giải bằng AI, đăng nhập và đồng bộ tài khoản |
| 3 | Đặt buổi tư vấn với chuyên gia, ví xu, thanh toán |
| 4 | Tarot nâng cao, mở rộng dịch vụ |

---

## Giấy phép

Mã nguồn thuộc sở hữu của công ty. Bộ tranh Tarot dùng bản đã hết hạn bản quyền,
xem `assets/cards/NGUON.md`.
