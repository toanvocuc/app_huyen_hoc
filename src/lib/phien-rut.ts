/** Giữ tạm lần rút vừa xong để màn kết quả đọc. Không lưu lâu dài. */
import type { LaDaRut } from '@/lib/tarot';

let phien: { cacLa: LaDaRut[]; cauHoi: string } | null = null;

export function datPhien(cacLa: LaDaRut[], cauHoi = '') {
  phien = { cacLa, cauHoi };
}

export function layPhien() {
  return phien;
}
