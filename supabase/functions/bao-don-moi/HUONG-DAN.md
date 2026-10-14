# Báo đơn mới cho thầy, bằng email

Khách đặt lịch → đơn ghi xuống bảng `yeu_cau_tu_van` → Supabase tự gọi hàm này →
thầy và công ty nhận email trong vài giây.

Năm bước dưới đây làm một lần. Sau đó không phải đụng vào nữa.

---

## 1. Chạy migration 0012 rồi 0013

Supabase → SQL Editor → chạy lần lượt:

- `supabase/migrations/0012_bao-don-moi.sql` — thêm cột cho bảng thầy và bảng nhật ký
- `supabase/migrations/0013_tach_lien_he_thay.sql` — chuyển email sang bảng riêng

Phải chạy cả hai. 0012 để email trong bảng `chuyen_gia`, mà bảng đó ai cũng đọc
được vì app cần hiện danh sách thầy cho cả khách chưa đăng nhập — tức là địa chỉ
cá nhân của thầy lộ ra với bất cứ ai cầm khoá công khai. 0013 sửa chỗ đó.

## 2. Điền email của thầy

**Việc này làm thẳng dưới Supabase, KHÔNG đưa vào `data/chuyen_gia.csv`.**

Repo trên GitHub là repo công khai. Địa chỉ email cá nhân nằm trong repo công khai
thì robot thu thập địa chỉ quét được và giữ mãi, xoá sau cũng không gỡ được khỏi
mấy kho dữ liệu đã sao chép.

SQL Editor, chạy câu này, thay địa chỉ thật vào:

```sql
insert into lien_he_chuyen_gia (chuyen_gia, email)
values ('luna-chiem-tinh', 'dia-chi-cua-thay@example.com')
on conflict (chuyen_gia) do update set email = excluded.email;
```

Bảng `lien_he_chuyen_gia` bật khoá dòng mà không khai luật nào, nên khoá công
khai đọc ra số không. Chỉ Edge Function cầm khoá quản trị mới xuyên qua được.

## 3. Dọn hai thầy giả

`nap-du-lieu.mjs` dùng `upsert`, tức là nó thêm và sửa chứ không xoá. Hai hồ sơ
thử tôi tạo hồi trước vẫn nằm dưới Supabase dù đã bỏ khỏi file CSV.

Phải dọn: để hồ sơ bịa trong app lúc nộp chợ là dính điều 2.1 của Apple.

```sql
delete from chuyen_gia where ma in ('thay-thu-1', 'thay-thu-2');
```

## 4. Mở tài khoản Resend

1. Đăng ký ở <https://resend.com> — gói miễn phí 3.000 thư mỗi tháng, không cần thẻ.
2. Lấy API key ở mục **API Keys**.
3. Đặt khoá đó vào Supabase. Chạy ở máy, trong thư mục dự án:

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxxxxxxx \
  EMAIL_CONG_TY=hopthu-cua-cong-ty@example.com
```

Bỏ qua `EMAIL_GUI_TU` thì thư gửi từ `onboarding@resend.dev` — chạy được ngay,
nhưng dễ rơi vào hộp thư rác. Có tên miền riêng thì xác thực nó ở Resend rồi đặt
thêm:

```bash
supabase secrets set EMAIL_GUI_TU='Omora <dat-lich@ten-mien-cua-ban.com>'
```

## 5. Đưa hàm lên và nối dây

```bash
supabase functions deploy bao-don-moi
```

Rồi vào Supabase → **Database** → **Webhooks** → **Create a new hook**:

| Ô | Điền |
|---|---|
| Name | `bao-don-moi` |
| Table | `yeu_cau_tu_van` |
| Events | chỉ tick **Insert** |
| Type | Supabase Edge Functions |
| Edge Function | `bao-don-moi` |

---

## Thử xem có chạy không

Đặt một lịch thật trong app, rồi kiểm hai chỗ:

```sql
select tao_luc, gui_toi, thanh_cong, loi
  from nhat_ky_bao_tin order by tao_luc desc limit 5;
```

- `thanh_cong = true` → thư đã đi. Không thấy trong hộp thư thì xem mục rác.
- `thanh_cong = false` → cột `loi` nói rõ hỏng ở đâu.

## Mấy chỗ hay hỏng

**`Chua dat RESEND_API_KEY`** — bước 4 chưa chạy, hoặc chạy rồi mà chưa đưa hàm
lên lại. Đặt bí mật xong phải `deploy` lại một lần.

**`Resend 403`** — địa chỉ trong `EMAIL_GUI_TU` thuộc tên miền chưa xác thực.
Dùng tạm `onboarding@resend.dev`.

**`Chua khai email cho thay lan cho cong ty`** — bước 2 chưa chạy, và cũng chưa
đặt `EMAIL_CONG_TY`.

**Nhật ký trống trơn** — webhook ở bước 5 chưa nối. Xem mục Webhooks, cột
Response của lần gọi gần nhất.

---

## Vì sao hàm luôn trả về 200

Kể cả khi gửi thư hỏng. Trả lỗi thì Supabase sẽ gọi lại, mà đơn thì đã ghi xong
rồi — gọi lại chỉ sinh thư trùng chứ không cứu được gì. Mọi lần gửi, trúng hay
trượt, đều nằm trong `nhat_ky_bao_tin` để còn tra.

## Còn thiếu gì

Thầy nhận được thư rồi vẫn phải vào Supabase **đổi tay** cột `trang_thai` sang
`da_nhan` thì khách mới thấy trong app:

```sql
update yeu_cau_tu_van set trang_thai = 'da_nhan' where ma = '<mã đơn trong thư>';
```

Được với một thầy, không được với mười. Trang quản trị cho thầy tự bấm là việc
tiếp theo, khoảng ba tới bốn ngày.
