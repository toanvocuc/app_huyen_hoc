/**
 * Giữ tạm những gì khách nhập trong năm bước, chỉ ghi lên máy chủ ở bước cuối.
 * Bỏ ngang giữa chừng thì không để lại hồ sơ dở dang.
 */
import type { GioiTinh } from '@/lib/ho-so';

export type BanNhap = {
  hoTen: string;
  ngay: string;
  thang: string;
  nam: string;
  gio: string;
  phut: string;
  noiSinh: string | null;
  gioiTinh: GioiTinh | null;
};

let ban: BanNhap = {
  hoTen: '', ngay: '', thang: '', nam: '', gio: '', phut: '', noiSinh: null, gioiTinh: null,
};

export const layBanNhap = () => ban;
export const datBanNhap = (phan: Partial<BanNhap>) => {
  ban = { ...ban, ...phan };
};
export const xoaBanNhap = () => {
  ban = { hoTen: '', ngay: '', thang: '', nam: '', gio: '', phut: '', noiSinh: null, gioiTinh: null };
};
