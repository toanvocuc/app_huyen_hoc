/**
 * Hồ sơ khách, đọc từ phía thầy.
 *
 * Thầy chỉ đọc được hồ sơ của khách ĐÃ ĐẶT MÌNH — luật khoá dòng ở migration
 * 0018 lo việc đó, không phải file này. Nên ở đây không có phép kiểm nào: kiểm
 * ở máy khách là thứ ai cũng gỡ được.
 *
 * VÌ SAO ĐỌC HỒ SƠ CHỨ KHÔNG CHÉP SANG ĐƠN
 *
 * Tên khách thì chép sang đơn, vì tên lúc đặt mới là tên đúng để xưng hô. Nhưng
 * ngày sinh, giờ sinh và đường liên lạc thì phải lấy bản mới nhất: khách sửa lại
 * giờ sinh cho đúng, hay đổi số điện thoại, mà đơn giữ bản cũ thì thầy luận giải
 * theo số sai và gọi vào số không còn dùng.
 */

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { XEM_THU_THAY } from '@/lib/xem-thu';

export type HoSoKhach = {
  ho_ten: string | null;
  ngay_sinh: string | null;
  gio_sinh: string | null;
  noi_sinh: string | null;
  lien_he: string | null;
};

const MAU_KHACH: HoSoKhach = {
  ho_ten: 'Nguyễn Thị Ánh Đào',
  ngay_sinh: '1995-09-16',
  gio_sinh: '07:30',
  noi_sinh: 'Hà Nội',
  lien_he: '0912345678',
};

/**
 * Hồ sơ của một khách cụ thể.
 *
 * Chỉ gọi khi thầy bấm mở, không gọi sẵn cho cả danh sách: mười đơn là mười
 * lượt hỏi máy chủ cho thứ thầy có thể không xem tới.
 */
export function useHoSoKhach(maNguoiDung: string | null) {
  const [khach, datKhach] = useState<HoSoKhach | null>(XEM_THU_THAY ? MAU_KHACH : null);
  const [xong, datXong] = useState(XEM_THU_THAY);

  const doc = useCallback(() => {
    if (XEM_THU_THAY || !maNguoiDung) return;
    let huy = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('ho_so')
          .select('ho_ten, ngay_sinh, gio_sinh, noi_sinh, lien_he')
          .eq('nguoi_dung', maNguoiDung)
          .maybeSingle();
        if (!huy) datKhach((data as HoSoKhach) ?? null);
      } catch {
        if (!huy) datKhach(null);
      } finally {
        if (!huy) datXong(true);
      }
    })();
    return () => {
      huy = true;
    };
  }, [maNguoiDung]);

  useEffect(doc, [doc]);
  return { khach, xong };
}

/** '1995-09-16' thành '16/9/1995'. Trả null nếu chuỗi không đúng khuôn. */
export function ngayDoc(ngay: string | null | undefined): string | null {
  if (!ngay) return null;
  const [n, t, g] = ngay.split('-').map(Number);
  if (!n || !t || !g) return null;
  return `${g}/${t}/${n}`;
}

/**
 * Đường mở ứng dụng cho một chuỗi liên lạc.
 *
 * Khách gõ gì cũng nhận: số điện thoại, đường dẫn Zalo đầy đủ, hay zalo.me
 * thiếu phần đầu. Đoán sai thì trả null để màn hình chỉ hiện chữ chứ không bày
 * ra một cái nút bấm vào không ra gì.
 */
export function duongLienHe(lienHe: string | null | undefined): string | null {
  const s = (lienHe ?? '').trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^zalo\.me\//i.test(s)) return `https://${s}`;
  const so = s.replace(/[\s.\-()]/g, '');
  if (/^\+?\d{9,15}$/.test(so)) return `tel:${so}`;
  return null;
}
