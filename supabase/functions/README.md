# Hàm chạy trên Supabase

Thư mục này KHÔNG phải mã của app. Nó chạy trên Deno ở phía Supabase, nên dùng
bộ thư viện khác hẳn — `Deno.serve`, `jsr:@supabase/supabase-js`.

Vì vậy `tsconfig.json` ở gốc dự án loại trừ thư mục này. Để chung thì `tsc` của
app báo hàng loạt lỗi "Cannot find name 'Deno'", mà toàn là lỗi giả.

Muốn kiểm kiểu mấy hàm ở đây thì cài Deno rồi chạy `deno check`.
