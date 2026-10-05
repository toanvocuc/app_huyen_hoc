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
 * Điểm hợp 1 tới 5, chấm theo góc chiếu giữa hai cung.
 *
 * Bản trước chấm theo nguyên tố rồi cộng thêm cho cặp hợp truyền thống. Cách đó
 * dồn 73% số cặp vào hai đầu 2 sao và 5 sao, còn mức 1 sao thì không cặp nào
 * chạm tới, nên thang điểm gần như chỉ có hai nấc.
 *
 * Cách này đếm hai cung cách nhau mấy bậc trên vòng hoàng đạo, là cách chuẩn
 * trong chiêm tinh, và cho ra 12 / 12 / 18 / 24 / 12 cặp cho mức 1 tới 5.
 */
const DIEM_THEO_KHOANG_CACH: Record<number, number> = {
  0: 4, // trùng cung: hiểu nhau ngay, nhưng cùng một tật
  1: 3, // kề nhau: ít điểm chung, không va nhau mà cũng không dính nhau
  2: 4, // lục hợp: bổ cho nhau, cần một bên chủ động
  3: 2, // vuông góc: va chạm thật, hai bên cùng muốn cầm trịch
  4: 5, // tam hợp: cùng nguyên tố, ăn ý gần như không phải cố
  5: 1, // lệch hẳn: lệch nhau gần như mọi mặt
  6: 3, // đối đỉnh: hai cực, hút nhau mà cũng mài nhau
};

/** Hai cung cách nhau mấy bậc, tính theo đường ngắn hơn trên vòng tròn. */
export function khoangCachCung(a: MaCung, b: MaCung): number {
  const i = CUNG.findIndex((c) => c.ma === a);
  const j = CUNG.findIndex((c) => c.ma === b);
  const h = Math.abs(i - j);
  return Math.min(h, 12 - h);
}

export function diemHop(a: MaCung, b: MaCung): number {
  return DIEM_THEO_KHOANG_CACH[khoangCachCung(a, b)];
}
