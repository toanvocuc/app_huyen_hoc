/**
 * Ghi lại ba mốc để đếm phễu: khách xem hết kết quả, nhìn thấy mục hỏi chuyên gia, rồi bấm.
 *
 * Ghi lỗi thì bỏ qua, không chặn đường của khách — đếm sai vài lượt còn hơn làm app khựng.
 * Nhưng vẫn phải in lỗi ra, đừng nuốt im lặng.
 */

import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

export type LoaiSuKien = 'xem_ket_qua' | 'thay_muc_hoi' | 'bam_zalo';

/** Mã ngắn cho khách dán vào Zalo. Bỏ chữ dễ nhìn nhầm: I, O, 0, 1. */
const BANG_CHU = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function sinhMaTheoDoi(doDai = 4): string {
  let ma = '';
  for (let i = 0; i < doDai; i++) {
    ma += BANG_CHU[Math.floor(Math.random() * BANG_CHU.length)];
  }
  return ma;
}

/**
 * Ghi một sự kiện. Trả về true nếu đã ghi được xuống máy chủ.
 *
 * Chỗ gọi nào không quan tâm kết quả thì cứ bỏ qua giá trị trả về. Riêng lúc bấm
 * Zalo thì phải xem, vì mã đưa cho khách mà không có dòng nào dưới máy chủ là
 * người trực tra không ra, mà khách lại tưởng mình đã được ghi nhận.
 */
export async function ghiSuKien(arg: {
  loai: LoaiSuKien;
  manHinh?: string;
  maTheoDoi?: string;
}): Promise<boolean> {
  if (XEM_THU) return true;
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return false;

    const { error } = await supabase.from('su_kien').insert({
      nguoi_dung: data.user.id,
      loai: arg.loai,
      man_hinh: arg.manHinh ?? null,
      ma_theo_doi: arg.maTheoDoi ?? null,
    });
    if (error) {
      console.warn('[su-kien] ghi that bai:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[su-kien] ghi that bai:', e);
    return false;
  }
}

/**
 * Sinh mã rồi ghi luôn lượt bấm Zalo. Trả về mã đã ghi được, hoặc null.
 *
 * Mã chỉ có 4 ký tự trong bảng 32 chữ nên vẫn có lúc trùng, mà cột ma_theo_doi
 * lại đánh chỉ mục duy nhất, nên lần ghi đó hỏng. Thử lại vài lần với mã khác là
 * hết. Thử hết vẫn hỏng thì trả null để chỗ gọi đừng đưa mã ma cho khách.
 */
export async function ghiLuotBamZalo(manHinh: string, soLanThu = 3): Promise<string | null> {
  for (let i = 0; i < soLanThu; i++) {
    const ma = sinhMaTheoDoi();
    if (await ghiSuKien({ loai: 'bam_zalo', manHinh, maTheoDoi: ma })) return ma;
  }
  return null;
}
