/**
 * Kiểm nhanh phần tính toán, chạy bằng: npm run kiem-tra
 * Không cần máy ảo, không cần máy chủ. Chạy trước mỗi lần commit cho chắc.
 */
import { boDau, rutGon, soChuDao, soVanMenh } from '../src/lib/numerology.ts';
import { CUNG, cungTheoNgay, diemHop } from '../src/lib/zodiac.ts';

let loi = 0;
function kiem(ten: string, thuc: unknown, mong: unknown) {
  const ok = JSON.stringify(thuc) === JSON.stringify(mong);
  if (!ok) loi++;
  console.log(
    `${ok ? 'OK  ' : 'SAI '} ${ten}: ${JSON.stringify(thuc)}` +
      (ok ? '' : ` (mong ${JSON.stringify(mong)})`)
  );
}

// --- thần số học ---------------------------------------------------------
// Chữ Đ phải ra D. Bỏ Đ đi là cả cái tên ra sai số.
kiem('bo dau, chu D gach', boDau('Nguyễn Thị Ánh Đào'), 'NGUYEN THI ANH DAO');
kiem('bo dau, du loai dau', boDau('Lê Hoàng Vũ Ưng'), 'LE HOANG VU UNG');
kiem('so van menh', soVanMenh('Nguyễn Thị Ánh Đào'), 4);
kiem('so chu dao 16/09/1995', soChuDao(16, 9, 1995), 4);
kiem('so chu dao 04/07/1979', soChuDao(4, 7, 1979), 1);
// Số chủ giữ nguyên, không cộng dồn tiếp.
kiem('giu so chu 11', rutGon(11), 11);
kiem('giu so chu 22', rutGon(22), 22);
kiem('giu so chu 33', rutGon(33), 33);

// --- cung hoàng đạo ------------------------------------------------------
kiem('cung 16/09', cungTheoNgay(16, 9), 'virgo');
kiem('cung 01/01', cungTheoNgay(1, 1), 'capricorn');
kiem('cung 25/12', cungTheoNgay(25, 12), 'capricorn');
kiem('cung 20/03', cungTheoNgay(20, 3), 'pisces');
kiem('cung 21/03', cungTheoNgay(21, 3), 'aries');

const soNgay = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const thieu: string[] = [];
for (let m = 1; m <= 12; m++)
  for (let d = 1; d <= soNgay[m - 1]; d++) if (!cungTheoNgay(d, m)) thieu.push(`${d}/${m}`);
kiem('moi ngay trong nam deu ra cung', thieu, []);

kiem('hop Bach Duong - Su Tu', diemHop('aries', 'leo'), 5);
kiem('hop Kim Nguu - Bo Cap', diemHop('taurus', 'scorpio'), 5);
kiem('hop cung cung', diemHop('gemini', 'gemini'), 4);
kiem(
  'do hop doi xung',
  CUNG.every((a) => CUNG.every((b) => diemHop(a.ma, b.ma) === diemHop(b.ma, a.ma))),
  true
);

console.log(loi === 0 ? '\n==> TAT CA DEU DUNG' : `\n==> CO ${loi} CHO SAI`);
process.exit(loi === 0 ? 0 : 1);
