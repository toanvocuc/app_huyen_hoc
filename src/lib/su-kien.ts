/**
 * Ghi lại ba mốc để đếm phễu: khách xem hết kết quả, nhìn thấy mục hỏi chuyên gia, rồi bấm.
 *
 * Ghi lỗi thì bỏ qua, không chặn đường của khách — đếm sai vài lượt còn hơn làm app khựng.
 * Nhưng vẫn phải in lỗi ra, đừng nuốt im lặng.
 */

import { supabase } from '@/lib/supabase';

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

export async function ghiSuKien(arg: {
  loai: LoaiSuKien;
  manHinh?: string;
  maTheoDoi?: string;
}): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const { error } = await supabase.from('su_kien').insert({
      nguoi_dung: data.user.id,
      loai: arg.loai,
      man_hinh: arg.manHinh ?? null,
      ma_theo_doi: arg.maTheoDoi ?? null,
    });
    if (error) console.warn('[su-kien] ghi that bai:', error.message);
  } catch (e) {
    console.warn('[su-kien] ghi that bai:', e);
  }
}
