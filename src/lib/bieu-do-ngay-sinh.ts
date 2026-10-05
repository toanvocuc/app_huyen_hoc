/**
 * Biểu đồ ngày sinh (ô vuông Lo Shu).
 *
 * Xếp hết chữ số của ngày sinh vào lưới ba hàng ba cột, bỏ qua số 0:
 *
 *      3 6 9
 *      2 5 8
 *      1 4 7
 *
 * Ba số thẳng hàng mà có đủ thì thành một mũi tên mạnh, trống cả ba thì thành
 * một mũi tên thiếu. Có tám đường thẳng nên nhiều nhất là tám mũi tên mỗi loại.
 *
 * Phép tính nằm ở đây, câu chữ nằm trong cơ sở dữ liệu (bảng mui_ten_bieu_do và
 * con_so_bieu_do). Tách vậy để sửa chữ nghĩa không phải phát hành lại app.
 */

/** Tám đường thẳng của lưới, viết theo đúng thứ tự hiện cho khách xem. */
export const DUONG_THANG = [
  [1, 5, 9],
  [3, 5, 7],
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
] as const;

export type Duong = (typeof DUONG_THANG)[number];

/** Mã của một đường, trùng cột cac_so trong cơ sở dữ liệu. */
export function maDuong(d: readonly number[]): string {
  return d.join('-');
}

/** Đếm mỗi chữ số xuất hiện bao nhiêu lần trong ngày sinh. Số 0 không vào lưới. */
export function demChuSo(ngay: number, thang: number, nam: number): Record<number, number> {
  const chuoi = `${String(ngay).padStart(2, '0')}${String(thang).padStart(2, '0')}${nam}`;
  const dem: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const c of chuoi) {
    const n = Number(c);
    if (n >= 1 && n <= 9) dem[n] += 1;
  }
  return dem;
}

/**
 * Vị trí của một số trong lưới, tính theo hàng và cột bắt đầu từ 0.
 *
 * Lưới vẽ ngược chiều so với cách đánh số: số 1 nằm ở hàng DƯỚI cùng chứ không
 * phải hàng trên. Nhầm chỗ này là cả cái biểu đồ lật ngược mà nhìn vẫn thấy hợp lý.
 */
export function oCuaSo(n: number): { hang: number; cot: number } {
  return { hang: 2 - ((n - 1) % 3), cot: Math.floor((n - 1) / 3) };
}

export type MucDo = 'thieu' | 'co' | 'nhieu';

/** Không có là thiếu, một tới hai lần là có, từ ba lần trở lên là nhiều. */
export function mucDo(soLan: number): MucDo {
  if (soLan === 0) return 'thieu';
  return soLan >= 3 ? 'nhieu' : 'co';
}

export type KetQuaBieuDo = {
  /** Số lần xuất hiện của từng chữ số từ 1 tới 9. */
  dem: Record<number, number>;
  /** Những đường có đủ cả ba số. */
  duongDay: Duong[];
  /** Những đường trống cả ba số. */
  duongTrong: Duong[];
};

export function tinhBieuDo(ngay: number, thang: number, nam: number): KetQuaBieuDo {
  const dem = demChuSo(ngay, thang, nam);
  const duongDay: Duong[] = [];
  const duongTrong: Duong[] = [];

  for (const d of DUONG_THANG) {
    if (d.every((n) => dem[n] > 0)) duongDay.push(d);
    else if (d.every((n) => dem[n] === 0)) duongTrong.push(d);
  }

  return { dem, duongDay, duongTrong };
}
