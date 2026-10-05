/** Rút bài Tarot: bộ 78 lá, trải một lá hoặc ba lá, và lá bài của ngày hôm nay. */

import * as Crypto from 'expo-crypto';

export type Bo = 'Ẩn Chính' | 'Cốc' | 'Gậy' | 'Kiếm' | 'Tiền';

export type LaBai = {
  ma: string;
  bo: Bo;
  so: number;
  tenVi: string;
  tenEn: string;
  tuKhoa: string;
  yNghiaXuoi: string;
  yNghiaNguoc: string;
  tinhCam: string;
  congViec: string;
  loiKhuyen: string;
};

export type LaDaRut = {
  la: LaBai;
  nguoc: boolean;
  viTri: string;
};

export type KieuTrai = 'mot-la' | 'ba-la';

export const VI_TRI: Record<KieuTrai, string[]> = {
  'mot-la': ['Câu trả lời'],
  'ba-la': ['Quá khứ', 'Hiện tại', 'Tương lai'],
};

/**
 * Tỷ lệ một lá rút ra bị ngược.
 *
 * Bản đầu để 50%, tức mỗi lá tung đồng xu. Nghe thì công bằng nhưng sai cả hai
 * đường. Xóc bài bằng tay không lật ngược một nửa bộ: muốn có lá ngược thì phải
 * cố ý xoay một phần bộ bài, nên tỷ lệ thật thấp hơn nhiều. Và lá ngược là nghĩa
 * xấu, nên 50% nghĩa là cứ hai lần rút ba lá thì một lần khách nhận gần như toàn
 * tin xấu — đo ra đúng 50,1%.
 *
 * Để 30% thì lá ngược vẫn xuất hiện đủ để có sức nặng, mà không thành thường ngày.
 */
export const TY_LE_NGUOC = 0.3;

/** Số nguyên 32 bit lớn nhất cộng một, dùng để đưa số ngẫu nhiên về khoảng 0 tới 1. */
const MOC_32_BIT = 4294967296;

/**
 * Rút ngẫu nhiên không lặp lá.
 * Dùng bộ sinh số ngẫu nhiên của hệ điều hành, không dùng Math.random,
 * vì Math.random đoán được và lá bài là thứ khách cảm thấy phải thật.
 */
export function rutBai(boBai: LaBai[], kieu: KieuTrai, choPhepNguoc = true): LaDaRut[] {
  const viTri = VI_TRI[kieu];
  const conLai = [...boBai];
  const ketQua: LaDaRut[] = [];

  const soNgauNhien = Crypto.getRandomValues(new Uint32Array(viTri.length * 2));

  for (let i = 0; i < viTri.length; i++) {
    const chiSo = soNgauNhien[i * 2] % conLai.length;
    const [la] = conLai.splice(chiSo, 1);
    ketQua.push({
      la,
      nguoc: choPhepNguoc ? soNgauNhien[i * 2 + 1] / MOC_32_BIT < TY_LE_NGUOC : false,
      viTri: viTri[i],
    });
  }
  return ketQua;
}

/** Nội dung hiển thị cho một lá đã rút, tự chọn nghĩa xuôi hay ngược. */
export function yNghia(daRut: LaDaRut): string {
  return daRut.nguoc ? daRut.la.yNghiaNguoc : daRut.la.yNghiaXuoi;
}

/**
 * Lá bài hôm nay: mỗi người một lá cố định trong ngày.
 * Cùng một người, cùng một ngày thì luôn ra cùng một lá, kể cả khi mở lại app
 * hay đổi múi giờ máy. Đó là lý do dùng ngày theo giờ Việt Nam chứ không theo máy.
 */
export function ngayVietNam(luc = new Date()): string {
  const vn = new Date(luc.getTime() + 7 * 60 * 60 * 1000);
  return vn.toISOString().slice(0, 10);
}

export function laHomNay(boBai: LaBai[], maNguoiDung: string, ngay = ngayVietNam()): LaDaRut {
  // Băm đơn giản, đủ để trải đều và không cần chờ hàm bất đồng bộ.
  const chuoi = `${maNguoiDung}|${ngay}`;
  let h = 2166136261;
  for (let i = 0; i < chuoi.length; i++) {
    h ^= chuoi.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const chiSo = Math.abs(h) % boBai.length;
  return { la: boBai[chiSo], nguoc: false, viTri: 'Lá bài hôm nay' };
}
