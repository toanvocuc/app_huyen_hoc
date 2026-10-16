/**
 * Đẩy một dòng thông báo tới mọi máy của người nhận.
 *
 * DÙNG CHUNG CHO MỌI LOẠI THÔNG BÁO
 *
 * Hàm này không biết gì về tư vấn, về shop, hay về bất cứ việc gì. Nó chỉ nhận
 * một dòng trong bảng `thong_bao` rồi đẩy đi. Thêm nguồn mới về sau — đơn hàng,
 * khuyến mãi, nhắc hẹn — chỉ là ghi thêm một dòng vào bảng đó, không phải viết
 * thêm hàm nào ở đây.
 *
 * Kích hoạt bằng trigger trên chính bảng `thong_bao`, nên dòng trong bảng là
 * bản gốc còn tiếng rung chỉ là tiếng gọi. Không bao giờ có cảnh máy rung mà mở
 * chuông ra trống trơn.
 *
 * TRIỂN KHAI
 *
 *   supabase functions deploy day-thong-bao
 *
 * Dùng chung bí mật BI_MAT_WEBHOOK với hàm bao-don-moi.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const BI_MAT = Deno.env.get('BI_MAT_WEBHOOK') ?? '';

const quanTri = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

type DongThongBao = {
  ma: string;
  nguoi_nhan: string;
  loai: string;
  tieu_de: string;
  noi_dung: string | null;
  duong_dan: string | null;
};

async function ghiNhatKy(guiToi: string, thanhCong: boolean, loi?: string) {
  try {
    await quanTri
      .from('nhat_ky_bao_tin')
      .insert({ gui_toi: guiToi, thanh_cong: thanhCong, loi: loi ?? null });
  } catch (e) {
    console.error('[day-thong-bao] ghi nhat ky hong', e);
  }
}

Deno.serve(async (req) => {
  try {
    if (BI_MAT && req.headers.get('x-bi-mat') !== BI_MAT) {
      console.warn('[day-thong-bao] goi khong dung bi mat');
      return new Response('khong duoc phep', { status: 401 });
    }

    const than = await req.json();
    const tb: DongThongBao | null = than?.record ?? null;
    if (!tb?.ma || !tb.nguoi_nhan) return new Response('khong co dong nao', { status: 200 });

    const { data: may } = await quanTri
      .from('thiet_bi')
      .select('ma_day')
      .eq('nguoi_dung', tb.nguoi_nhan);

    const dsMa = (may ?? []).map((m) => m.ma_day as string).filter(Boolean);
    if (dsMa.length === 0) {
      // Không có máy nào KHÔNG phải lỗi: dòng vẫn nằm trong chuông, người nhận
      // mở app ra là thấy. Vẫn ghi lại để còn biết vì sao máy không rung.
      await ghiNhatKy(`day:${tb.loai}`, false, 'Nguoi nhan chua bat thong bao tren may nao');
      return new Response('khong co may nao', { status: 200 });
    }

    const than_ = tb.noi_dung
      ? tb.noi_dung.length > 160
        ? tb.noi_dung.slice(0, 160).trimEnd() + '…'
        : tb.noi_dung
      : '';

    const tin = dsMa.map((to) => ({
      to,
      title: tb.tieu_de,
      body: than_,
      sound: 'default',
      priority: 'high',
      // Bấm vào thông báo thì mở đúng màn nó nói tới. Màn gốc đọc ô `man` này.
      data: { man: tb.duong_dan ?? undefined, thong_bao: tb.ma },
    }));

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
      await ghiNhatKy(`day:${tb.loai} (${dsMa.length} may)`, false, JSON.stringify(kq).slice(0, 300));
    } else {
      await ghiNhatKy(`day:${tb.loai} (${dsMa.length} may)`, true);
    }

    // LUÔN trả 200: trả lỗi thì Supabase gọi lại, mà dòng thông báo đã ghi xong
    // rồi nên gọi lại chỉ sinh tiếng rung trùng.
    return new Response('da day', { status: 200 });
  } catch (e) {
    console.error('[day-thong-bao]', e);
    await ghiNhatKy('day:(chua xac dinh)', false, e instanceof Error ? e.message : String(e));
    return new Response('hong, da ghi nhat ky', { status: 200 });
  }
});
