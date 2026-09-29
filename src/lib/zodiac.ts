/** Cung hoàng đạo phương Tây: xác định cung từ ngày sinh và tính độ hợp. */

export type MaCung =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type NguyenTo = 'Hoả' | 'Thổ' | 'Khí' | 'Thuỷ';

type MocCung = {
  ma: MaCung;
  ten: string;
  tuThang: number;
  tuNgay: number;
  denThang: number;
  denNgay: number;
  nguyenTo: NguyenTo;
  hopVoi: MaCung[];
};

export const CUNG: MocCung[] = [
  { ma: 'aries', ten: 'Bạch Dương', tuThang: 3, tuNgay: 21, denThang: 4, denNgay: 19, nguyenTo: 'Hoả', hopVoi: ['leo', 'sagittarius', 'gemini', 'aquarius'] },
  { ma: 'taurus', ten: 'Kim Ngưu', tuThang: 4, tuNgay: 20, denThang: 5, denNgay: 20, nguyenTo: 'Thổ', hopVoi: ['virgo', 'capricorn', 'cancer', 'pisces'] },
  { ma: 'gemini', ten: 'Song Tử', tuThang: 5, tuNgay: 21, denThang: 6, denNgay: 20, nguyenTo: 'Khí', hopVoi: ['libra', 'aquarius', 'aries', 'leo'] },
  { ma: 'cancer', ten: 'Cự Giải', tuThang: 6, tuNgay: 21, denThang: 7, denNgay: 22, nguyenTo: 'Thuỷ', hopVoi: ['scorpio', 'pisces', 'taurus', 'virgo'] },
  { ma: 'leo', ten: 'Sư Tử', tuThang: 7, tuNgay: 23, denThang: 8, denNgay: 22, nguyenTo: 'Hoả', hopVoi: ['aries', 'sagittarius', 'gemini', 'libra'] },
  { ma: 'virgo', ten: 'Xử Nữ', tuThang: 8, tuNgay: 23, denThang: 9, denNgay: 22, nguyenTo: 'Thổ', hopVoi: ['taurus', 'capricorn', 'cancer', 'scorpio'] },
  { ma: 'libra', ten: 'Thiên Bình', tuThang: 9, tuNgay: 23, denThang: 10, denNgay: 22, nguyenTo: 'Khí', hopVoi: ['gemini', 'aquarius', 'leo', 'sagittarius'] },
  { ma: 'scorpio', ten: 'Bọ Cạp', tuThang: 10, tuNgay: 23, denThang: 11, denNgay: 21, nguyenTo: 'Thuỷ', hopVoi: ['cancer', 'pisces', 'virgo', 'capricorn'] },
  { ma: 'sagittarius', ten: 'Nhân Mã', tuThang: 11, tuNgay: 22, denThang: 12, denNgay: 21, nguyenTo: 'Hoả', hopVoi: ['aries', 'leo', 'libra', 'aquarius'] },
  { ma: 'capricorn', ten: 'Ma Kết', tuThang: 12, tuNgay: 22, denThang: 1, denNgay: 19, nguyenTo: 'Thổ', hopVoi: ['taurus', 'virgo', 'scorpio', 'pisces'] },
  { ma: 'aquarius', ten: 'Bảo Bình', tuThang: 1, tuNgay: 20, denThang: 2, denNgay: 18, nguyenTo: 'Khí', hopVoi: ['gemini', 'libra', 'aries', 'sagittarius'] },
  { ma: 'pisces', ten: 'Song Ngư', tuThang: 2, tuNgay: 19, denThang: 3, denNgay: 20, nguyenTo: 'Thuỷ', hopVoi: ['cancer', 'scorpio', 'taurus', 'capricorn'] },
];

/** Xác định cung từ ngày và tháng sinh. Mọi ngày trong năm đều ra đúng một cung. */
export function cungTheoNgay(ngay: number, thang: number): MaCung | null {
  for (const c of CUNG) {
    if ((thang === c.tuThang && ngay >= c.tuNgay) || (thang === c.denThang && ngay <= c.denNgay)) {
      return c.ma;
    }
  }
  return null;
}

export function timCung(ma: MaCung): MocCung {
  const c = CUNG.find((x) => x.ma === ma);
  if (!c) throw new Error(`Khong co cung: ${ma}`);
  return c;
}

/**
 * Điểm hợp 1 tới 5, dựng theo quan hệ nguyên tố rồi cộng thêm cho cặp hợp truyền thống.
 * Hoả hợp Khí, Thổ hợp Thuỷ. Cùng nguyên tố thì hiểu nhau nhưng dễ giống nhau quá.
 */
const DIEM_NGUYEN_TO: Record<string, number> = {
  'Hoả|Hoả': 4, 'Hoả|Khí': 5, 'Hoả|Thổ': 2, 'Hoả|Thuỷ': 2,
  'Khí|Khí': 4, 'Khí|Thổ': 2, 'Khí|Thuỷ': 3,
  'Thổ|Thổ': 4, 'Thổ|Thuỷ': 5,
  'Thuỷ|Thuỷ': 4,
};

export function diemHop(a: MaCung, b: MaCung): number {
  const ca = timCung(a);
  const cb = timCung(b);
  let d = DIEM_NGUYEN_TO[`${ca.nguyenTo}|${cb.nguyenTo}`] ?? DIEM_NGUYEN_TO[`${cb.nguyenTo}|${ca.nguyenTo}`] ?? 3;
  if (ca.hopVoi.includes(b) || cb.hopVoi.includes(a)) d = Math.min(5, d + 1);
  if (a === b) d = 4;
  return d;
}
