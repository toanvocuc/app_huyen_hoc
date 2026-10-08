/**
 * Đếm và giới hạn số lượt rút bài trong ngày.
 *
 * Trước đây rút bao nhiêu lần cũng được. Nghe thì rộng rãi, nhưng nó phá chính
 * thứ app đang bán: khách rút ba lần ra ba quẻ khác nhau thì tự biết quẻ của
 * mình chẳng có nghĩa gì. Trong nghề bói cũng vậy, hỏi lại cùng một câu là điều
 * người bói từ chối.
 *
 * Đếm trên máy chủ chứ không đếm trong máy khách, vì xoá dữ liệu app là đếm lại
 * từ đầu. Bảng `lan_rut` vốn đã ghi từng lượt kèm thời điểm nên không phải thêm
 * bảng mới.
 *
 * Lá bài hôm nay KHÔNG tính vào đây: nó cố định theo người và theo ngày, mở bao
 * nhiêu lần cũng ra một lá, nên không có gì để siết. Màn kết quả cũng chỉ ghi
 * `mot-la` và `ba-la` xuống bảng này.
 */

import { useCallback, useEffect, useState } from 'react';

import { maNguoiDung, supabase } from '@/lib/supabase';
import { ngayVietNam } from '@/lib/tarot';
import { XEM_THU } from '@/lib/xem-thu';

export const SO_LUOT_MOI_NGAY = 3;

/** Mốc nửa đêm hôm nay theo giờ Việt Nam, dạng máy chủ hiểu được. */
export function dauNgayVN(luc: Date = new Date()): string {
  return `${ngayVietNam(luc)}T00:00:00+07:00`;
}

/**
 * Đã rút mấy lượt hôm nay. Trả null nếu không đếm được.
 *
 * Null khác 0: không đếm được thì cho rút tiếp. Chặn khách thật vì mạng chập
 * chờn còn tệ hơn là để lọt vài lượt.
 */
export async function demLuotHomNay(): Promise<number | null> {
  if (XEM_THU) return 0;
  try {
    const ma = await maNguoiDung();
    if (!ma) return null;
    const { count, error } = await supabase
      .from('lan_rut')
      .select('*', { count: 'exact', head: true })
      .eq('nguoi_dung', ma)
      .gte('tao_luc', dauNgayVN());
    if (error) return null;
    return count ?? null;
  } catch {
    return null;
  }
}

export function useLuotRut() {
  const [daRut, setDaRut] = useState<number | null>(null);
  const [dangTai, setDangTai] = useState(true);

  const taiLai = useCallback(() => {
    setDangTai(true);
    demLuotHomNay()
      .then(setDaRut)
      .finally(() => setDangTai(false));
  }, []);

  useEffect(taiLai, [taiLai]);

  // daRut null nghĩa là không đếm được: coi như còn lượt.
  const conLai = daRut === null ? SO_LUOT_MOI_NGAY : Math.max(0, SO_LUOT_MOI_NGAY - daRut);
  return { conLai, hetLuot: conLai === 0, dangTai, taiLai };
}
