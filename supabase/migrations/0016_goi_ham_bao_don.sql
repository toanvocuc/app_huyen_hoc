-- Gọi hàm báo tin mỗi khi có đơn mới, không qua Database Webhooks của Supabase.
--
-- CHỈ CHẠY FILE NÀY NẾU không tạo được webhook bằng giao diện.
--
-- Cách của Supabase dựng một trigger gọi `supabase_functions.http_request`. Lược
-- đồ đó chỉ tồn tại sau khi đã bật Database Webhooks một lần, và mục đó đã dời
-- chỗ trong giao diện nên không phải lúc nào cũng tìm ra. File này làm đúng việc
-- ấy bằng `pg_net` gọi thẳng, nên không phụ thuộc vào chỗ nào trong giao diện.
--
-- TRƯỚC KHI CHẠY, thay hai chỗ:
--   KHOA_CONG_KHAI  →  EXPO_PUBLIC_SUPABASE_ANON_KEY trong file .env
--   BI_MAT_WEBHOOK  →  cùng giá trị đã đặt bằng `supabase secrets set`,
--                      hoặc xoá hẳn dòng đó nếu chưa đặt bí mật nào

create extension if not exists pg_net;

create or replace function bao_don_moi_cho_thay() returns trigger
language plpgsql
security definer
-- search_path rỗng và gọi tên đầy đủ: hàm security definer mà để search_path mở
-- là ai đó tạo một hàm trùng tên ở lược đồ khác rồi chiếm quyền.
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://dgoyowwhblqmdsnpxwgo.supabase.co/functions/v1/bao-don-moi',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer KHOA_CONG_KHAI',
      'x-bi-mat', 'BI_MAT_WEBHOOK'
    ),
    -- Gói vào khoá `record` cho giống hệt hình dạng mà Database Webhooks gửi,
    -- nhờ vậy hàm bên kia không cần biết nó được gọi bằng đường nào.
    body := jsonb_build_object('record', to_jsonb(new)),
    timeout_milliseconds := 5000
  );
  return null;
end $$;

-- `after insert` chứ không phải `before`: đơn phải ghi xong rồi mới báo. Báo
-- trước mà lệnh ghi hỏng thì thầy nhận tin về một đơn không tồn tại.
--
-- pg_net gửi đi rồi trả về ngay, không chờ trả lời. Nghĩa là hàm bên kia chậm
-- hay hỏng cũng không làm chậm lệnh đặt lịch của khách.
drop trigger if exists yeu_cau_moi_thi_bao on yeu_cau_tu_van;
create trigger yeu_cau_moi_thi_bao
after insert on yeu_cau_tu_van
for each row execute function bao_don_moi_cho_thay();
