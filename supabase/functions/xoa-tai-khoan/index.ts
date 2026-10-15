/**
 * Xoá hẳn tài khoản của người đang gọi.
 *
 * VÌ SAO PHẢI CÓ
 *
 * Apple điều 5.1.1(v): app nào cho đăng ký tài khoản thì bắt buộc phải cho xoá
 * tài khoản NGAY TRONG APP. Không được bắt khách gửi email xin xoá, không được
 * chỉ xoá dữ liệu rồi giữ lại tài khoản.
 *
 * App tự làm việc này không được: xoá một dòng trong auth.users cần khoá quản
 * trị, mà khoá đó không bao giờ được nằm trong app — ai mở gói cài đặt ra cũng
 * đọc được, và cầm nó là đọc được dữ liệu của mọi khách.
 *
 * VÌ SAO KHÔNG CẦN XOÁ TỪNG BẢNG
 *
 * Mọi bảng mang dữ liệu khách đều khai `references auth.users(id) on delete
 * cascade`. Xoá dòng gốc trong auth.users là Postgres tự dọn hết. Nhờ vậy hàm
 * này không bao giờ "quên một bảng" — đúng con bug đã gặp với bảng danh_gia,
 * lúc danh sách bảng cần xoá viết tay thiếu mất một cái.
 *
 * AI ĐƯỢC GỌI
 *
 * Chỉ chính chủ. Hàm đọc thẻ đăng nhập trong tiêu đề Authorization, hỏi Supabase
 * xem thẻ đó của ai, rồi xoá đúng người đó. Không nhận mã người dùng từ thân
 * yêu cầu — nhận là ai cũng xoá được tài khoản của người khác.
 *
 * TRIỂN KHAI
 *
 *   supabase functions deploy xoa-tai-khoan
 *
 * Không cần đặt bí mật gì thêm: SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY đã có
 * sẵn trong môi trường của mọi Edge Function.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const URL_DU_AN = Deno.env.get('SUPABASE_URL') ?? '';
const KHOA_QUAN_TRI = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const KHOA_CONG_KHAI = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

/** App gọi từ máy khách nên phải trả lời được yêu cầu dò đường của trình duyệt. */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function tra(chu: string, ma: number) {
  return new Response(JSON.stringify({ thong_bao: chu }), {
    status: ma,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return tra('Chỉ nhận POST', 405);

  try {
    const the = req.headers.get('Authorization') ?? '';
    if (!the.startsWith('Bearer ')) return tra('Thiếu thẻ đăng nhập', 401);

    // Hỏi xem thẻ này của ai, bằng khoá CÔNG KHAI. Dùng khoá quản trị ở bước này
    // là sai: khoá quản trị bỏ qua mọi phép kiểm, nên một thẻ hết hạn hay thẻ
    // bịa cũng lọt.
    const ngoai = createClient(URL_DU_AN, KHOA_CONG_KHAI, {
      global: { headers: { Authorization: the } },
    });
    const { data: ai, error: loiThe } = await ngoai.auth.getUser();
    if (loiThe || !ai.user) return tra('Thẻ đăng nhập không hợp lệ', 401);

    const quanTri = createClient(URL_DU_AN, KHOA_QUAN_TRI);
    const { error } = await quanTri.auth.admin.deleteUser(ai.user.id);
    if (error) {
      console.error('[xoa-tai-khoan]', error.message);
      return tra('Chưa xoá được tài khoản. Thử lại giúp tôi.', 500);
    }

    console.log('[xoa-tai-khoan] da xoa', ai.user.id);
    return tra('Đã xoá tài khoản', 200);
  } catch (e) {
    console.error('[xoa-tai-khoan]', e);
    return tra('Chưa xoá được tài khoản. Thử lại giúp tôi.', 500);
  }
});
