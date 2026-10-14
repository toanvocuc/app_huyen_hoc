/**
 * Báo cho thầy biết có đơn mới, bằng email.
 *
 * Chạy trên Supabase Edge Function, tự kích hoạt bằng Database Webhook mỗi khi
 * có dòng mới trong `yeu_cau_tu_van`.
 *
 * VÌ SAO LÀ EMAIL CHỨ KHÔNG PHẢI ZALO
 *
 * Đơn ghi xuống cơ sở dữ liệu rồi nằm im ở đó, không ai biết. Thầy phải tự mở
 * trang quản trị Supabase ra xem — được với một thầy, không được với mười.
 *
 * Chọn email vì thầy nào cũng có, không phải cài gì, không chờ ai duyệt, và
 * không hỏng khi Zalo đổi chính sách. Zalo OA là đường đúng gu Việt Nam hơn
 * nhưng cần tài khoản chính thức, có phí và phải chờ xét duyệt.
 *
 * CHẠY HỎNG THÌ SAO
 *
 * Hàm này LUÔN trả về 200, kể cả khi gửi thư thất bại. Trả lỗi thì Supabase sẽ
 * thử lại, mà đơn thì đã ghi xong rồi — thử lại chỉ sinh ra thư trùng. Mọi lần
 * gửi, thành công hay không, đều ghi vào bảng `nhat_ky_bao_tin` để còn tra.
 *
 * TRIỂN KHAI
 *
 *   supabase functions deploy bao-don-moi
 *   supabase secrets set RESEND_API_KEY=... EMAIL_GUI_TU=... EMAIL_CONG_TY=...
 *
 * Rồi tạo Database Webhook trong Supabase: bảng `yeu_cau_tu_van`, sự kiện
 * INSERT, trỏ tới hàm này. Xem HUONG-DAN.md.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const KHOA_RESEND = Deno.env.get('RESEND_API_KEY') ?? '';
/** Địa chỉ đứng tên người gửi. Phải thuộc tên miền đã xác thực ở Resend. */
const GUI_TU = Deno.env.get('EMAIL_GUI_TU') ?? 'Omora <onboarding@resend.dev>';
/** Hộp thư của công ty, luôn nhận bản sao để có người trực theo dõi. */
const EMAIL_CONG_TY = Deno.env.get('EMAIL_CONG_TY') ?? '';

const quanTri = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

type DongYeuCau = {
  ma: string;
  chuyen_gia: string;
  chu_de: string;
  khung_gio: string;
  cau_hoi: string;
  tao_luc: string;
};

/** Chặn chữ của khách phá cấu trúc HTML của thư. */
function anToan(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function gioVN(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 7 * 3600 * 1000);
  const hai = (n: number) => String(n).padStart(2, '0');
  return `${hai(d.getUTCHours())}:${hai(d.getUTCMinutes())} ngày ${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

function soanThu(yc: DongYeuCau, tenThay: string): { tieuDe: string; than: string } {
  return {
    tieuDe: `Đơn tư vấn mới — ${yc.chu_de}, ${yc.khung_gio}`,
    than: `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
  <p style="font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#9a7a2a;margin:0 0 4px">Omora</p>
  <h1 style="font-size:21px;margin:0 0 20px">Có người vừa đặt lịch với ${anToan(tenThay)}</h1>

  <table style="width:100%;border-collapse:collapse;font-size:15px">
    <tr><td style="padding:7px 0;color:#666;width:120px">Chủ đề</td><td style="padding:7px 0"><b>${anToan(yc.chu_de)}</b></td></tr>
    <tr><td style="padding:7px 0;color:#666">Khách rảnh</td><td style="padding:7px 0"><b>${anToan(yc.khung_gio)}</b></td></tr>
    <tr><td style="padding:7px 0;color:#666">Đặt lúc</td><td style="padding:7px 0">${gioVN(yc.tao_luc)}</td></tr>
  </table>

  <p style="font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#9a7a2a;margin:24px 0 6px">Câu hỏi của khách</p>
  <div style="background:#f6f6f4;border-left:3px solid #d4a84b;padding:14px 16px;font-size:15px;line-height:1.65;white-space:pre-wrap">${anToan(yc.cau_hoi)}</div>

  <p style="font-size:14px;line-height:1.6;color:#555;margin:24px 0 0">
    Khách đang chờ trong app. Sau khi liên hệ được, vào Supabase đổi trạng thái đơn
    sang <b>da_nhan</b> để khách thấy là bạn đã nhận.
  </p>
  <p style="font-size:12px;color:#999;margin:18px 0 0">Mã đơn ${yc.ma}</p>
</div>`.trim(),
  };
}

async function guiThu(toi: string[], tieuDe: string, than: string) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KHOA_RESEND}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: GUI_TU, to: toi, subject: tieuDe, html: than }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

Deno.serve(async (req) => {
  let yc: DongYeuCau | null = null;
  let guiToi: string[] = [];

  try {
    const than = await req.json();
    yc = than?.record ?? null;
    if (!yc?.ma) return new Response('khong co dong nao', { status: 200 });

    const { data: thay } = await quanTri
      .from('chuyen_gia')
      .select('ten, email')
      .eq('ma', yc.chuyen_gia)
      .maybeSingle();

    // Thầy chưa khai email thì vẫn gửi cho công ty — có người trực còn hơn
    // không ai biết. Thiếu cả hai thì mới chịu.
    guiToi = [thay?.email, EMAIL_CONG_TY].filter(Boolean) as string[];
    if (guiToi.length === 0) throw new Error('Chua khai email cho thay lan cho cong ty');
    if (!KHOA_RESEND) throw new Error('Chua dat RESEND_API_KEY');

    const thu = soanThu(yc, thay?.ten ?? 'chuyên gia');
    await guiThu(guiToi, thu.tieuDe, thu.than);

    await quanTri.from('nhat_ky_bao_tin').insert({
      yeu_cau: yc.ma,
      gui_toi: guiToi.join(', '),
      thanh_cong: true,
    });
    return new Response('da gui', { status: 200 });
  } catch (e) {
    const loi = e instanceof Error ? e.message : String(e);
    console.error('[bao-don-moi]', loi);
    // Ghi nhật ký cả khi hỏng. Đây là thứ duy nhất để tra khi thầy bảo không
    // nhận được thư nào.
    try {
      await quanTri.from('nhat_ky_bao_tin').insert({
        yeu_cau: yc?.ma ?? null,
        gui_toi: guiToi.join(', ') || '(chua xac dinh)',
        thanh_cong: false,
        loi,
      });
    } catch {
      // Ghi nhật ký cũng hỏng nốt thì thôi, đừng để nó nuốt mất log bên trên.
    }
    // VẪN trả 200: trả lỗi thì Supabase gọi lại, mà đơn đã ghi xong rồi nên gọi
    // lại chỉ sinh thư trùng chứ không cứu được gì.
    return new Response('hong, da ghi nhat ky', { status: 200 });
  }
});
