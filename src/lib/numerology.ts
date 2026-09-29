/**
 * Thần số học: số chủ đạo từ ngày sinh, số vận mệnh từ họ tên.
 *
 * Hai chỗ rất dễ sai, đã xử lý sẵn ở đây:
 *  1. Tên tiếng Việt phải bỏ dấu trước khi tra bảng, và chữ Đ phải ra D chứ không được bỏ đi.
 *  2. Số chủ 11, 22, 33 giữ nguyên, không cộng dồn tiếp.
 */

/** Bảng Pythagoras. */
const CHU_CAI: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const NHOM_DAU: [string, string][] = [
  ['àáảãạăằắẳẵặâầấẩẫậ', 'a'],
  ['èéẻẽẹêềếểễệ', 'e'],
  ['ìíỉĩị', 'i'],
  ['òóỏõọôồốổỗộơờớởỡợ', 'o'],
  ['ùúủũụưừứửữự', 'u'],
  ['ỳýỷỹỵ', 'y'],
  ['đ', 'd'],
];

/**
 * Chuyển tên tiếng Việt về chữ cái không dấu.
 * Đ ra D. Bỏ Đ đi là cả cái tên ra sai số.
 */
export function boDau(ten: string): string {
  let s = ten.toLowerCase();
  for (const [nhom, thay] of NHOM_DAU) {
    for (const kyTu of nhom) {
      s = s.split(kyTu).join(thay);
    }
  }
  return s
    .toUpperCase()
    .split('')
    .filter((c) => /[A-Z ]/.test(c))
    .join('');
}

/** Cộng dồn về một chữ số. Giữ nguyên 11, 22, 33. */
export function rutGon(n: number, giuSoChu = true): number {
  while (n > 9) {
    if (giuSoChu && (n === 11 || n === 22 || n === 33)) return n;
    n = String(n)
      .split('')
      .reduce((t, c) => t + Number(c), 0);
  }
  return n;
}

/** Số chủ đạo từ ngày sinh. */
export function soChuDao(ngay: number, thang: number, nam: number): number {
  const chuoi = `${String(ngay).padStart(2, '0')}${String(thang).padStart(2, '0')}${nam}`;
  const tong = chuoi.split('').reduce((t, c) => t + Number(c), 0);
  return rutGon(tong);
}

/** Số vận mệnh từ họ tên đầy đủ. */
export function soVanMenh(hoTen: string): number {
  const tong = boDau(hoTen)
    .split('')
    .reduce((t, c) => t + (CHU_CAI[c] ?? 0), 0);
  return rutGon(tong);
}

/** Các số có thể xuất hiện, dùng để kiểm tra kho nội dung có đủ không. */
export const CAC_SO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as const;
