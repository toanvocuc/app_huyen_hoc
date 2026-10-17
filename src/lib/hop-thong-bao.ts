/**
 * Hộp thông báo trong app — cái chuông.
 *
 * Khác hẳn `lib/thong-bao.ts`: file kia lo tin đẩy của hệ điều hành, file này
 * lo danh sách nằm trong app.
 *
 * HAI THỨ ĐÓ PHẢI CÙNG MỘT NGUỒN
 *
 * Máy rung mà trong chuông không có dòng nào — hoặc ngược lại — là khách mất
 * tin tưởng ngay. Nên dòng trong bảng `thong_bao` mới là bản gốc: máy chủ ghi
 * dòng trước, rồi chính dòng đó mới sinh ra tiếng rung. App không bao giờ tự
 * thêm thông báo cho mình, và luật khoá dòng cũng không cho.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { maNguoiDung, supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

export type ThongBao = {
  ma: string;
  loai: string;
  tieu_de: string;
  noi_dung: string | null;
  duong_dan: string | null;
  da_doc: boolean;
  tao_luc: string;
};

const MAU: ThongBao[] = [
  {
    ma: 'tb-1',
    loai: 'dat_lich',
    tieu_de: 'Luna Chiêm Tinh đã nhận đơn của bạn',
    noi_dung: 'Chủ đề Tarot. Thầy sẽ hẹn bạn qua kênh liên lạc bạn để lại.',
    duong_dan: '/lich-cua-toi?don=xem-thu-1',
    da_doc: false,
    tao_luc: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    ma: 'tb-2',
    loai: 'dat_lich',
    tieu_de: 'Buổi tư vấn với Luna Chiêm Tinh đã xong',
    noi_dung: 'Cảm ơn bạn. Bạn chấm sao cho thầy ở trang hồ sơ nhé.',
    duong_dan: '/lich-cua-toi?don=xem-thu-3',
    da_doc: true,
    tao_luc: new Date(Date.now() - 3 * 86400_000).toISOString(),
  },
];

/**
 * Hộp thông báo của người đang đăng nhập.
 *
 * Đọc lại mỗi khi mở chuông chứ không giữ một đường nối mở sẵn: thông báo không
 * gấp tới mức cần tức thời, mà giữ đường nối thì tốn pin suốt thời gian app mở.
 */
export function useHopThongBao() {
  const [dong, datDong] = useState<ThongBao[] | null>(XEM_THU ? MAU : null);

  const taiLai = useCallback(async () => {
    if (XEM_THU) return;
    try {
      const toi = await maNguoiDung();
      if (!toi) return;
      const { data, error } = await supabase
        .from('thong_bao')
        .select('*')
        .eq('nguoi_nhan', toi)
        .order('tao_luc', { ascending: false })
        .limit(50);
      // PHẢI xét `error` trước.
      //
      // postgrest không ném lỗi: mất mạng hay trượt luật khoá dòng thì nó trả về
      // `{ data: null, error }` một cách bình thản. Nên khối `catch` dưới đây không
      // bao giờ chạy tới, và dòng cũ ở đây đọc `data` là null rồi gán mảng rỗng —
      // tức là làm đúng cái việc mà chú thích nói là tránh: xoá trắng chuông chỉ
      // vì mạng chập một nhịp.
      if (error) return;
      datDong((data as ThongBao[]) ?? []);
    } catch {
      // Hỏng thì giữ nguyên danh sách cũ. Chuông trống vì mạng chập còn tệ hơn
      // chuông cũ một chút.
    }
  }, []);

  // Đẩy lượt đọc đầu tiên ra khỏi nhịp vẽ hiện tại.
  //
  // Gọi thẳng trong thân hiệu ứng thì eslint bắt "đặt trạng thái ngay trong
  // effect", và nó bắt có lý: lượt đọc này chỉ để tô chấm đỏ trên chuông, không
  // có gì gấp tới mức phải chen vào giữa lúc màn đang dựng.
  useEffect(() => {
    const hen = setTimeout(taiLai, 0);
    return () => clearTimeout(hen);
  }, [taiLai]);

  const chuaDoc = useMemo(() => (dong ?? []).filter((t) => !t.da_doc).length, [dong]);

  /** Đánh dấu đã đọc. Sửa tại chỗ trước rồi mới gửi lên, để bấm xong thấy đổi ngay. */
  const danhDauDoc = useCallback(
    async (ma: string) => {
      datDong((ds) => (ds ?? []).map((t) => (t.ma === ma ? { ...t, da_doc: true } : t)));
      if (XEM_THU) return;
      try {
        await supabase.from('thong_bao').update({ da_doc: true }).eq('ma', ma);
      } catch {
        taiLai();
      }
    },
    [taiLai]
  );

  const xoa = useCallback(
    async (cacMa: string[]) => {
      if (cacMa.length === 0) return;
      datDong((ds) => (ds ?? []).filter((t) => !cacMa.includes(t.ma)));
      if (XEM_THU) return;
      try {
        await supabase.from('thong_bao').delete().in('ma', cacMa);
      } catch {
        taiLai();
      }
    },
    [taiLai]
  );

  return { dong: dong ?? [], chuaDoc, taiLai, danhDauDoc, xoa };
}

/** 'cách đây 2 giờ' — đủ dùng, không kéo cả thư viện ngày tháng vào. */
export function luc(iso: string): string {
  const giay = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (giay < 60) return 'vừa xong';
  if (giay < 3600) return `${Math.floor(giay / 60)} phút trước`;
  if (giay < 86400) return `${Math.floor(giay / 3600)} giờ trước`;
  if (giay < 7 * 86400) return `${Math.floor(giay / 86400)} ngày trước`;
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
