# Xoá tài khoản ngay trong app

Apple điều **5.1.1(v)**: app nào cho đăng ký tài khoản thì bắt buộc phải cho xoá
tài khoản trong app. Không được bắt khách gửi email xin xoá, không được chỉ xoá
dữ liệu rồi giữ lại tài khoản.

Không làm thì trượt, kể cả khi mọi điều khoản khác đã đạt.

## Đưa lên

```bash
npx supabase functions deploy xoa-tai-khoan
```

Hết. **Không cần đặt bí mật gì** — `SUPABASE_URL`, `SUPABASE_ANON_KEY` và
`SUPABASE_SERVICE_ROLE_KEY` đã có sẵn trong môi trường của mọi Edge Function.

Nếu nó đòi Docker thì thêm `--use-api` vào cuối lệnh.

## Thử

Trong app: **Cá nhân → Xoá tài khoản**, xác nhận hai lần.

Xong thì app đá về màn đăng nhập. Kiểm dưới Supabase:

- **Authentication → Users**: dòng của tài khoản đó biến mất
- `select count(*) from ho_so;` — giảm đi một
- `select count(*) from yeu_cau_tu_van;` — mọi đơn của người đó cũng đi theo

## Vì sao không xoá từng bảng

Mọi bảng mang dữ liệu khách đều khai `references auth.users(id) on delete
cascade`. Xoá dòng gốc trong `auth.users` là Postgres tự dọn hết.

Cách cũ viết tay một danh sách bảng rồi lặp qua. Chính nó sinh ra bug: bảng
`danh_gia` thêm vào ở migration 0010 mà không ai khai vào danh sách, nên điểm
sao khách chấm sống sót qua lệnh xoá. Bỏ danh sách đi là bỏ luôn cả loại lỗi đó.

## Vì sao hàm kiểm thẻ bằng khoá công khai

Hàm đọc thẻ đăng nhập trong tiêu đề `Authorization` rồi hỏi Supabase xem thẻ đó
của ai — bằng **khoá công khai**, không phải khoá quản trị. Khoá quản trị bỏ qua
mọi phép kiểm, nên dùng nó ở bước này thì một thẻ hết hạn hay thẻ bịa cũng lọt.

Và hàm **không** nhận mã người dùng từ thân yêu cầu. Nhận là ai cũng xoá được
tài khoản của người khác, chỉ cần đổi một con số.
