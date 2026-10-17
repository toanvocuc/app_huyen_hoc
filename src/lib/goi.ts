/**
 * Gói tư vấn của một thầy.
 *
 * Trước đây ba mức giá của thầy nằm chung trong một đoạn văn ở ô `gom_gi`:
 * khách phải tự đọc, tự so, rồi tự nhắn hỏi lại mình muốn gói nào. Đơn gửi đi
 * không mang theo thông tin đó, nên thầy mở ra cũng phải hỏi lại bằng tay.
 *
 * Giờ mỗi gói là một thứ bấm được, và đơn chụp lại tên cùng giá lúc đặt.
 * Xem migration 0023.
 */

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

export type Goi = {
  ma: string;
  chuyen_gia: string;
  ten: string;
  mo_ta: string | null;
  gia: number;
  /** Null với gói không tính theo thời lượng, ví dụ 'một câu hỏi cụ thể'. */
  phut: number | null;
  dang_nhan: boolean;
  thu_tu: number;
};

/** Ba gói thật của Luna, chép đúng dữ liệu trên máy chủ. Dùng cho chế độ xem thử. */
const MAU: Goi[] = [
  {
    ma: 'goi-1',
    chuyen_gia: 'luna-chiem-tinh',
    ten: 'Một câu hỏi cụ thể',
    mo_ta:
      'Bạn có đúng một chuyện đang vướng và muốn một câu trả lời thẳng. Luna đọc hoàn cảnh bạn viết rồi trả lời riêng cho câu đó.',
    gia: 150000,
    phut: null,
    dang_nhan: true,
    thu_tu: 1,
  },
  {
    ma: 'goi-2',
    chuyen_gia: 'luna-chiem-tinh',
    ten: 'Buổi 30 phút',
    mo_ta:
      'Đủ thời gian để đi hết một chuyện và hỏi lại những chỗ còn lấn cấn, thay vì chỉ nhận một câu trả lời rồi thôi.',
    gia: 300000,
    phut: 30,
    dang_nhan: true,
    thu_tu: 2,
  },
  {
    ma: 'goi-3',
    chuyen_gia: 'luna-chiem-tinh',
    ten: 'Buổi 60 phút',
    mo_ta:
      'Buổi dài nhất, kết hợp chiêm tinh và hành trình linh hồn. Dành cho lúc bạn muốn nhìn cả giai đoạn chứ không chỉ một việc trước mắt.',
    gia: 500000,
    phut: 60,
    dang_nhan: true,
    thu_tu: 3,
  },
];

/** '150.000đ' */
export function tienGoi(d: number): string {
  return `${d.toLocaleString('vi-VN')}đ`;
}

/** 'Buổi 30 phút · 300.000đ' — một dòng gọn để nhét vào thẻ đơn. */
export function dongGoi(ten: string | null, gia: number | null): string | null {
  if (!ten) return null;
  return gia ? `${ten} · ${tienGoi(gia)}` : ten;
}

/**
 * Các gói của một thầy, đã lọc gói đang ngưng nhận và xếp theo thứ tự thầy đặt.
 *
 * Trả mảng rỗng khi thầy chưa khai gói nào — màn hình phải chạy được trong
 * trường hợp đó, vì thầy mới thêm vào thì chưa có gói ngay.
 */
export function useGoiTuVan(maThay: string | null | undefined) {
  const [dong, datDong] = useState<Goi[] | null>(
    XEM_THU ? MAU.filter((g) => g.chuyen_gia === maThay) : null
  );

  const doc = useCallback(() => {
    if (XEM_THU || !maThay) return;
    let huy = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('goi_tu_van')
          .select('*')
          .eq('chuyen_gia', maThay)
          .eq('dang_nhan', true)
          .order('thu_tu', { ascending: true });
        // Xét `error` trước: postgrest không ném, nó trả { data: null, error }.
        // Không xét thì mạng chập thành "thầy này không có gói nào".
        if (huy || error) return;
        datDong((data as Goi[]) ?? []);
      } catch {
        // Giữ nguyên danh sách cũ.
      }
    })();
    return () => {
      huy = true;
    };
  }, [maThay]);

  useEffect(doc, [doc]);

  return { dong: dong ?? [], dangTai: dong === null && Boolean(maThay) };
}
