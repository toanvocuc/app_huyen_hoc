/**
 * Báo cho thầy biết có đơn mới.
 *
 * Chạy trên Supabase Edge Function, tự kích hoạt bằng Database Webhook mỗi khi
 * có dòng mới trong `yeu_cau_tu_van`.
 *
 * HAI ĐƯỜNG BÁO, ĐƯỜNG NÀO CHẠY ĐƯỢC THÌ CHẠY
 *
 *   1. ĐẨY THÔNG BÁO về máy thầy — đường chính. Thầy đăng nhập tư cách chuyên
 *      gia trong app, máy chủ biết mã thiết bị, đẩy thẳng. Nhanh, không rơi vào
 *      hộp thư rác, và thầy bấm vào là mở app ra làm việc luôn.
 *
 *   2. EMAIL — đường phụ, chỉ chạy khi đã khai RESEND_API_KEY. Chưa khai thì
 *      hàm bỏ qua chứ không coi là hỏng.
 *
 * Hai đường độc lập: một đường hỏng không kéo đường kia theo. Mỗi đường ghi một
 * dòng riêng vào `nhat_ky_bao_tin` để còn tra khi thầy bảo không nhận được gì.
 *
 * CHẠY HỎNG THÌ SAO
 *
 * Hàm LUÔN trả về 200. Trả lỗi thì Supabase gọi lại, mà đơn đã ghi xong rồi nên
 * gọi lại chỉ sinh thông báo trùng chứ không cứu được gì.
 *
 * TRIỂN KHAI
 *
 *   supabase functions deploy bao-don-moi
 *
 * Phần đẩy thông báo KHÔNG cần đặt bí mật nào. Muốn thêm email thì mới cần
 * RESEND_API_KEY và EMAIL_CONG_TY — xem HUONG-DAN.md.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const KHOA_RESEND = Deno.env.get('RESEND_API_KEY') ?? '';
/** Địa chỉ đứng tên người gửi. Phải thuộc tên miền đã xác thực ở Resend. */
const GUI_TU = Deno.env.get('EMAIL_GUI_TU') ?? 'Omora <onboarding@resend.dev>';
/** Hộp thư của công ty, nhận bản sao để luôn có người trực nhìn thấy. */
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

/** Ghi lại một lần báo, trúng hay trượt. Đây là thứ duy nhất để tra về sau. */
async function ghiNhatKy(yeuCau: string | null, guiToi: string, thanhCong: boolean, loi?: string) {
  try {
    await quanTri.from('nhat_ky_bao_tin').insert({
      yeu_cau: yeuCau,
      gui_toi: guiToi,
      thanh_cong: thanhCong,
      loi: loi ?? null,
    });
  } catch (e) {
    console.error('[bao-don-moi] ghi nhat ky hong', e);
  }
}

// ------------------------------------------------------------------ đẩy thông báo

async function dayThongBao(yc: DongYeuCau, taiKhoan: string | null) {
  if (!taiKhoan) {
    await ghiNhatKy(yc.ma, 'day', false, 'Thay chua dang nhap tu cach chuyen gia');
    return;
  }

  const { data: may } = await quanTri
    .from('thiet_bi')
    .select('ma_day')
    .eq('nguoi_dung', taiKhoan);

  const dsMa = (may ?? []).map((m) => m.ma_day as string).filter(Boolean);
  if (dsMa.length === 0) {
    await ghiNhatKy(yc.ma, 'day', false, 'Thay chua bat thong bao tren may nao');
    return;
  }

  // Cắt câu hỏi cho vừa phần thân thông báo. Dài quá thì hệ điều hành tự cắt ở
  // chỗ xấu; cắt chủ động rồi thêm dấu ba chấm thì đọc ra là còn nữa.
  const trich = yc.cau_hoi.length > 140 ? yc.cau_hoi.slice(0, 140).trimEnd() + '…' : yc.cau_hoi;

  const tin = dsMa.map((to) => ({
    to,
    title: `Đơn mới · ${yc.chu_de}`,
    body: `${yc.khung_gio}\n${trich}`,
    sound: 'default',
    priority: 'high',
    // Mở rộng ra khi khách kéo thông báo xuống, để đọc hết câu hỏi mà không
    // phải mở app.
    data: { man: '/thay', yeu_cau: yc.ma },
  }));

  try {
    const tra = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(tin),
    });
    const kq = await tra.json();
    // Expo trả 200 ngay cả khi từng tin hỏng, lỗi nằm trong từng phần tử. Không
    // soi vào đó thì nhật ký báo thành công trong khi chẳng tin nào tới nơi.
    const hong = (kq?.data ?? []).filter((d: { status?: string }) => d?.status !== 'ok');
    if (!tra.ok || hong.length > 0) {
      await ghiNhatKy(yc.ma, `day (${dsMa.length} may)`, false, JSON.stringify(kq).slice(0, 300));
      return;
    }
    await ghiNhatKy(yc.ma, `day (${dsMa.length} may)`, true);
  } catch (e) {
    await ghiNhatKy(yc.ma, 'day', false, e instanceof Error ? e.message : String(e));
  }
}

// ------------------------------------------------------------------ email

function soanThu(yc: DongYeuCau, tenThay: string) {
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
    Mở Omora, đăng nhập tư cách chuyên gia để xem và nhận đơn.
  </p>
  <p style="font-size:12px;color:#999;margin:18px 0 0">Mã đơn ${yc.ma}</p>
</div>`.trim(),
  };
}

async function guiThu(yc: DongYeuCau, tenThay: string, emailThay: string | null) {
  if (!KHOA_RESEND) return; // Chưa khai thì bỏ qua, không phải lỗi.

  const toi = [emailThay, EMAIL_CONG_TY].filter(Boolean) as string[];
  if (toi.length === 0) {
    await ghiNhatKy(yc.ma, 'email', false, 'Chua khai email cho thay lan cho cong ty');
    return;
  }

  const thu = soanThu(yc, tenThay);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KHOA_RESEND}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: GUI_TU, to: toi, subject: thu.tieuDe, html: thu.than }),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
    await ghiNhatKy(yc.ma, toi.join(', '), true);
  } catch (e) {
    await ghiNhatKy(yc.ma, toi.join(', '), false, e instanceof Error ? e.message : String(e));
  }
}

// ------------------------------------------------------------------ cửa vào

Deno.serve(async (req) => {
  try {
    const than = await req.json();
    const yc: DongYeuCau | null = than?.record ?? null;
    if (!yc?.ma) return new Response('khong co dong nao', { status: 200 });

    // Tên lấy ở bảng hồ sơ, email và tài khoản lấy ở bảng liên hệ. Hai bảng vì
    // bảng hồ sơ ai cũng đọc được — app cần nó để hiện danh sách thầy — nên để
    // email hay mã tài khoản ở đó là lộ ra cho bất cứ ai cầm khoá công khai.
    const [{ data: thay }, { data: lienHe }] = await Promise.all([
      quanTri.from('chuyen_gia').select('ten').eq('ma', yc.chuyen_gia).maybeSingle(),
      quanTri
        .from('lien_he_chuyen_gia')
        .select('email, tai_khoan')
        .eq('chuyen_gia', yc.chuyen_gia)
        .maybeSingle(),
    ]);

    // Hai đường chạy song song và độc lập: một đường hỏng không kéo đường kia theo.
    await Promise.all([
      dayThongBao(yc, (lienHe?.tai_khoan as string | null) ?? null),
      guiThu(yc, thay?.ten ?? 'chuyên gia', (lienHe?.email as string | null) ?? null),
    ]);

    return new Response('da bao', { status: 200 });
  } catch (e) {
    console.error('[bao-don-moi]', e);
    await ghiNhatKy(null, '(chua xac dinh)', false, e instanceof Error ? e.message : String(e));
    return new Response('hong, da ghi nhat ky', { status: 200 });
  }
});
