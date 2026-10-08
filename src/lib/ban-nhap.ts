/**
 * Giữ tạm những gì khách nhập trong năm bước, chỉ ghi lên máy chủ ở bước cuối.
 * Bỏ ngang giữa chừng thì không để lại hồ sơ dở dang.
 */
import type { GioiTinh, HoSo } from '@/lib/ho-so';
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
/**
 * Nạp bản nhập từ hồ sơ đang có, để sửa một mục mà không mất các mục khác.
 *
 * Mấy mục trong phần Cá nhân dẫn thẳng vào giữa luồng nhập năm bước, mà bước
 * cuối thì ghi CẢ hồ sơ từ bản nhập tạm. Bản tạm đã bị dọn sau lần tạo tài
 * khoản đầu, nên vào từ giữa luồng là ghi đè họ tên rỗng và ngày sinh "-00-00"
 * lên hồ sơ thật.
 *
 * Nạp sẵn ở đây thì bước nào không sửa vẫn ghi lại đúng giá trị cũ.
 */
export function napTuHoSo(h: HoSo | null) {
  if (!h) return;
  const [nam = '', thang = '', ngay = ''] = (h.ngay_sinh ?? '').split('-');
  const [gio = '', phut = ''] = (h.gio_sinh ?? '').split(':');
  ban = {
    hoTen: h.ho_ten ?? '',
    ngay: ngay ? String(Number(ngay)) : '',
    thang: thang ? String(Number(thang)) : '',
    nam,
    gio: gio ? String(Number(gio)) : '',
    phut,
    noiSinh: h.noi_sinh,
    gioiTinh: h.gioi_tinh,
  };
}

export const xoaBanNhap = () => {
  ban = { ...TRONG };
};
