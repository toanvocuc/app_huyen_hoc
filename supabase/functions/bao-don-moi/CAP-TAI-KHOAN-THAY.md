# Cấp tài khoản chuyên gia cho thầy

Làm một lần cho mỗi thầy. Khoảng năm phút.

## 1. Chạy migration 0014

Supabase → SQL Editor → dán `supabase/migrations/0014_dang_nhap_thay.sql` → chạy.

## 2. Tạo tài khoản đăng nhập cho thầy

Supabase → **Authentication** → **Users** → **Add user** → *Create new user*.

- **Email**: địa chỉ của thầy
- **Password**: đặt một mật khẩu tạm, đủ mạnh
- **Bật** mục *Auto Confirm User*

Không bật xác nhận tự động thì Supabase gửi thư xác nhận, mà thầy chưa chắc đọc
được — tài khoản treo ở trạng thái chưa xác nhận và đăng nhập sẽ hỏng.

Đưa mật khẩu cho thầy bằng kênh riêng, đừng nhắn trong nhóm chat chung.

## 3. Nối tài khoản đó với hồ sơ thầy

```sql
update lien_he_chuyen_gia
   set tai_khoan = (select id from auth.users where email = 'dia-chi-cua-thay')
 where chuyen_gia = 'luna-chiem-tinh';
```

Kiểm lại:

```sql
select chuyen_gia, tai_khoan is not null as da_noi from lien_he_chuyen_gia;
```

Phải ra `da_noi = true`. Chưa có dòng nào cho thầy đó thì dùng `insert` thay cho
`update`.

## 4. Đưa hàm báo tin lên

```bash
npx supabase functions deploy bao-don-moi
```

Rồi Supabase → **Database** → **Webhooks** → **Create a new hook**:

| Ô | Điền |
|---|---|
| Name | `bao-don-moi` |
| Table | `yeu_cau_tu_van` |
| Events | chỉ tick **Insert** |
| Type | Supabase Edge Functions |
| Edge Function | `bao-don-moi` |

**Phần đẩy thông báo không cần khai bí mật nào.** Email là đường phụ, chỉ chạy
khi đã khai `RESEND_API_KEY` — chưa khai thì hàm bỏ qua chứ không coi là hỏng.

## 5. Thầy đăng nhập

Trong app: màn đăng nhập → dòng chữ nhỏ cuối màn **"Tôi là chuyên gia của
Omora"** → nhập email và mật khẩu → **bấm đồng ý khi máy xin quyền thông báo**.

Bước xin quyền là bắt buộc. Từ chối là đơn của khách nằm im, không ai biết.

Kiểm đã nhận mã thiết bị chưa:

```sql
select t.ma_day, t.nen_tang
  from thiet_bi t
  join lien_he_chuyen_gia l on l.tai_khoan = t.nguoi_dung
 where l.chuyen_gia = 'luna-chiem-tinh';
```

Có dòng là xong.

## 6. Thử

Trên một máy khác, đăng nhập tư cách khách rồi đặt một lịch. Máy của thầy phải
rung trong vài giây.

Không thấy gì thì tra:

```sql
select tao_luc, gui_toi, thanh_cong, loi
  from nhat_ky_bao_tin order by tao_luc desc limit 5;
```

- `gui_toi = 'day'`, `loi = 'Thay chua dang nhap tu cach chuyen gia'` → bước 3 chưa chạy
- `loi = 'Thay chua bat thong bao tren may nao'` → bước 5 chưa xong, hoặc thầy từ chối quyền
- Nhật ký trống trơn → webhook ở bước 4 chưa nối
