/**
 * Chấm sao cho thầy tư vấn. CHỈ SỐ SAO, không có chữ.
 *
 * Cố ý bỏ phần bình luận ở bản này. Có chữ do khách viết là app rơi vào diện
 * "nội dung do người dùng tạo", mà Apple điều 1.2 bắt app loại đó phải lọc được
 * nội dung phản cảm, có đường báo cáo và chặn được người xấu — kéo theo cả một
 * trang quản trị để duyệt từng câu. Một con số từ 1 tới 5 thì không có gì để
 * kiểm duyệt.
 *
 * Điểm trung bình do máy chủ tự tính lại mỗi khi có ai chấm, và nằm sẵn trong
 * bảng thầy. Nhờ vậy mở danh sách không phải tải hết đánh giá về rồi cộng.
 */

import { useCallback, useEffect, useState } from 'react';

import { maNguoiDung, supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

/** Mình đã chấm thầy này mấy sao. Trả null nếu chưa chấm. */
export function useDiemCuaToi(maThay: string) {
  const [sao, setSao] = useState<number | null>(null);
  const [xong, setXong] = useState(false);

  const taiLai = useCallback(() => {
    if (XEM_THU) {
      setSao(5);
      setXong(true);
      return;
    }
    maNguoiDung()
      .then((toi) =>
        toi
          ? supabase
              .from('danh_gia')
              .select('sao')
              .eq('chuyen_gia', maThay)
              .eq('nguoi_dung', toi)
              .maybeSingle()
          : null
      )
      .then((kq) => setSao((kq?.data?.sao as number | undefined) ?? null))
      .catch(() => setSao(null))
      .finally(() => setXong(true));
  }, [maThay]);

  useEffect(taiLai, [taiLai]);
  return { sao, xong, taiLai };
}

/**
 * Chấm hoặc đổi điểm.
 *
 * Bảng lấy cặp thầy–người làm khoá chính, nên chấm lần hai là sửa lần một chứ
 * không thêm dòng mới.
 */
export async function chamSao(maThay: string, sao: number) {
  if (XEM_THU) return;
  const toi = await maNguoiDung();
  if (!toi) throw new Error('Chưa có phiên đăng nhập');

  const { error } = await supabase
    .from('danh_gia')
    .upsert(
      { chuyen_gia: maThay, nguoi_dung: toi, sao },
      { onConflict: 'chuyen_gia,nguoi_dung' }
    );
  if (error) throw error;
}
