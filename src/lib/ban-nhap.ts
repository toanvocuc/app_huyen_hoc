/**
 * Giữ tạm những gì khách nhập trong năm bước, chỉ ghi lên máy chủ ở bước cuối.
 * Bỏ ngang giữa chừng thì không để lại hồ sơ dở dang.
 */
import type { GioiTinh } from '@/lib/ho-so';
import { HO_SO_MAU, XEM_THU } from '@/lib/xem-thu';

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

const TRONG: BanNhap = {
  hoTen: '', ngay: '', thang: '', nam: '', gio: '', phut: '', noiSinh: null, gioiTinh: null,
};

/**
 * Chế độ xem thử mở sẵn dữ liệu mẫu, để vào thẳng màn hoàn tất vẫn xem được.
 * Bản chạy thật luôn bắt đầu từ bản nhập trống.
 */
function banDau(): BanNhap {
  if (!XEM_THU) return { ...TRONG };
  const [nam, thang, ngay] = (HO_SO_MAU.ngay_sinh ?? '1995-09-16').split('-');
  const [gio, phut] = (HO_SO_MAU.gio_sinh ?? '07:30').split(':');
  return {
    hoTen: HO_SO_MAU.ho_ten ?? '',
    ngay: String(Number(ngay)),
    thang: String(Number(thang)),
    nam,
    gio: String(Number(gio)),
    phut,
    noiSinh: HO_SO_MAU.noi_sinh,
    gioiTinh: HO_SO_MAU.gioi_tinh,
  };
}

let ban: BanNhap = banDau();

export const layBanNhap = () => ban;
export const datBanNhap = (phan: Partial<BanNhap>) => {
  ban = { ...ban, ...phan };
};
export const xoaBanNhap = () => {
  ban = { ...TRONG };
};
