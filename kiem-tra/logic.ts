// Dự án là React Native nên tsconfig không nạp sẵn kiểu của Node. Chỉ file kiểm
// thử này chạy bằng Node, nên khai riêng ở đây thay vì mở ra cho cả dự án.
/// <reference types="node" />

/**
 * Kiểm nhanh phần tính toán, chạy bằng: npm run kiem-tra
 * Không cần máy ảo, không cần máy chủ. Chạy trước mỗi lần commit cho chắc.
 */
import { randomFillSync } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { demChuSo, oCuaSo, mucDo, tinhBieuDo } from '../src/lib/bieu-do-ngay-sinh.ts';
import { boDau, rutGon, soChuDao, soVanMenh } from '../src/lib/numerology.ts';
// Doi ten vi file nay da co mot bien soNgay khac, la so ngay cua tung thang.
import {
  buocDi,
  layBaiTuVi,
  ngayVN,
  soNgay as soThuTuNgay,
  soTuan,
  THU_TU_CUNG_DE_KIEM,
} from '../src/lib/tu-vi.ts';
import { CUNG, cungTheoNgay, diemHop } from '../src/lib/zodiac.ts';
import { khoangNamSinh, ngayHopLe, soNgayTrongThang } from '../src/lib/ngay-thang.ts';

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

// --- biểu đồ ngày sinh ---------------------------------------------------
// Số 0 không có ô nào trong lưới nên phải bị bỏ qua, không thì đếm sai hết.
kiem('bo so 0 khi dem', demChuSo(1, 1, 2000)[1], 2);

// Lưới vẽ ngược chiều đánh số: số 1 nằm hàng dưới cùng, số 3 nằm hàng trên cùng.
// Nhầm chỗ này là cả biểu đồ lật ngược mà nhìn vẫn thấy hợp lý.
kiem('o cua so 1', oCuaSo(1), { hang: 2, cot: 0 });
kiem('o cua so 3', oCuaSo(3), { hang: 0, cot: 0 });
kiem('o cua so 5', oCuaSo(5), { hang: 1, cot: 1 });
kiem('o cua so 9', oCuaSo(9), { hang: 0, cot: 2 });

const bd = tinhBieuDo(14, 7, 1971); // ra 1 mui ten day va 1 mui ten trong
kiem('14/07/1971 mui ten day', bd.duongDay.map((d) => d.join('-')), ['1-4-7']);
kiem('14/07/1971 mui ten trong', bd.duongTrong.map((d) => d.join('-')), ['2-5-8']);
kiem('14/07/1971 dem so 1', bd.dem[1], 3);

// Một đường chỉ thiếu một số thì không phải mũi tên nào cả, cả đầy lẫn trống.
const bd2 = tinhBieuDo(6, 6, 1994);
kiem('06/06/1994 khong co mui ten day', bd2.duongDay.length, 0);
kiem('06/06/1994 mui ten trong', bd2.duongTrong.map((d) => d.join('-')), ['3-5-7', '2-5-8']);

kiem('muc do 0 lan', mucDo(0), 'thieu');
kiem('muc do 2 lan', mucDo(2), 'co');
kiem('muc do 3 lan', mucDo(3), 'nhieu');

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

// Tam hop, tuc cung nguyen to, la muc cao nhat.
kiem('hop Bach Duong - Su Tu', diemHop('aries', 'leo'), 5);
kiem('hop Xu Nu - Ma Ket', diemHop('virgo', 'capricorn'), 5);
// Doi dinh thi hut nhau ma cung mai nhau, khong phai muc cao nhat.
kiem('hop Kim Nguu - Bo Cap', diemHop('taurus', 'scorpio'), 3);
kiem('hop cung cung', diemHop('gemini', 'gemini'), 4);
// Vuong goc va lech han la hai muc thap. Trang lichngaytot goi ba cap nay la khac tinh.
kiem('khac Bach Duong - Cu Giai', diemHop('aries', 'cancer'), 2);
kiem('khac Kim Nguu - Bao Binh', diemHop('taurus', 'aquarius'), 2);
kiem('khac Song Ngu - Nhan Ma', diemHop('pisces', 'sagittarius'), 2);
kiem('lech han Bach Duong - Xu Nu', diemHop('aries', 'virgo'), 1);

// Ban cu don 73% so cap vao hai dau 2 sao va 5 sao, con muc 1 sao thi khong cap
// nao cham toi. Dem lai de khong lang le quay ve tinh trang do.
const demDiem: Record<number, number> = {};
for (let i = 0; i < CUNG.length; i++)
  for (let j = i; j < CUNG.length; j++) {
    const d = diemHop(CUNG[i].ma, CUNG[j].ma);
    demDiem[d] = (demDiem[d] ?? 0) + 1;
  }
kiem('78 cap chia deu 5 muc', demDiem, { 1: 12, 2: 12, 3: 18, 4: 24, 5: 12 });
kiem(
  'khong muc nao chiem qua mot phan ba',
  Object.values(demDiem).every((n) => n <= 26),
  true
);
kiem(
  'do hop doi xung',
  CUNG.every((a) => CUNG.every((b) => diemHop(a.ma, b.ma) === diemHop(b.ma, a.ma))),
  true
);

// --- tu vi ngay va tuan ---------------------------------------------------
// tu-vi.ts chep lai thu tu 12 cung de khong phai nap gi luc chay, nho vay bo kiem
// thu goi thang duoc bang Node. Lech thu tu la chon sai bai cho ca 12 cung ma
// khong ai nhin ra, nen so lai o day.
kiem(
  'thu tu cung trong tu-vi.ts khop zodiac.ts',
  THU_TU_CUNG_DE_KIEM,
  CUNG.map((c) => c.ma)
);

// Ngay phai doi luc nua dem GIO VIET NAM, khong phai gio may khach.
kiem('ngay VN luc 17h UTC', ngayVN(new Date('2026-10-02T17:00:00Z')), '2026-10-03');
kiem('ngay VN luc 16h UTC', ngayVN(new Date('2026-10-02T16:00:00Z')), '2026-10-02');
kiem(
  'hai ngay lien nhau thi lien so',
  soThuTuNgay(new Date('2026-10-03T05:00:00Z')) - soThuTuNgay(new Date('2026-10-02T05:00:00Z')),
  1
);

// Tuan bat dau tu thu hai. 2026-10-05 la thu hai, 2026-10-04 la chu nhat truoc do.
kiem(
  'chu nhat va thu hai khac tuan',
  soTuan(new Date('2026-10-04T05:00:00Z')) + 1 === soTuan(new Date('2026-10-05T05:00:00Z')),
  true
);
kiem(
  'thu hai va chu nhat cuoi tuan cung so',
  soTuan(new Date('2026-10-05T05:00:00Z')) === soTuan(new Date('2026-10-11T05:00:00Z')),
  true
);

// Kho gia lap, moi muc mot co khac nhau, de kiem phep chon ma khong phu thuoc du lieu that.
const lam = (muc: 'tong_quan' | 'tinh_cam' | 'cong_viec' | 'suc_khoe', cung: string, n: number) =>
  Array.from({ length: n }, (_, i) => ({
    ky: 'ngay' as const,
    muc,
    cung,
    thu_tu: i,
    noi_dung: `${muc}-${i}`,
  }));
const khoThu = [
  ...lam('tong_quan', 'aries', 5),
  ...lam('tinh_cam', 'chung', 4),
  ...lam('cong_viec', 'chung', 3),
  ...lam('suc_khoe', 'chung', 3),
];

// Mo app muoi lan trong ngay phai ra y nguyen mot bai.
const luc1 = new Date('2026-10-02T01:00:00Z');
const luc2 = new Date('2026-10-02T09:00:00Z');
kiem(
  'cung mot ngay ra cung mot bai',
  layBaiTuVi(khoThu, 'aries', 'ngay', luc1).tongQuan ===
    layBaiTuVi(khoThu, 'aries', 'ngay', luc2).tongQuan,
  true
);

// Doi ngay thi phai doi bai, khong duoc dung yen.
const khacNhau: string[] = [];
for (let i = 0; i < 5; i++) {
  khacNhau.push(
    layBaiTuVi(khoThu, 'aries', 'ngay', new Date(Date.UTC(2026, 9, 2 + i, 5))).tongQuan ?? ''
  );
}
kiem('nam ngay lien ra nam bai khac nhau', new Set(khacNhau).size, 5);

// Kho rong thi tra null chu khong lam app chet.
const rong = layBaiTuVi([], 'aries', 'ngay');
kiem('kho rong khong lam app chet', rong.tongQuan, null);
kiem('kho rong van co diem hop le', rong.diem >= 2 && rong.diem <= 5, true);

// Ban tuan khong co muc suc khoe, nen phai tra null chu khong lay nham cua ban ngay.
kiem('ban tuan khong co muc suc khoe', layBaiTuVi(khoThu, 'aries', 'tuan').sucKhoe, null);

// Cung mot ngay, cac cung phai ra bai khac nhau, khong duoc dong loat giong het.
// Ban dau tron bang phep nhan cong, va 12 cung ra so may man chay deu 9,8,7,6,5...
// con diem sao thi lap 2,3,4,5 theo dung thu tu cung. Dem buoc nhay de bat lai.
const soTheoCung = CUNG.map((c) => layBaiTuVi([], c.ma, 'ngay', luc1).soMayMan);
const buoc = soTheoCung.slice(1).map((v, i) => v - soTheoCung[i]);
kiem('so may man khong chay thanh day deu', new Set(buoc).size > 3, true);

const diemTheoCung = CUNG.map((c) => layBaiTuVi([], c.ma, 'ngay', luc1).diem);
kiem('diem sao khong lap theo chu ky 4', diemTheoCung[0] !== diemTheoCung[4] || diemTheoCung[1] !== diemTheoCung[5], true);

kiem(
  'mot ngay, cac cung khong cung mot bai tinh cam',
  new Set(CUNG.map((c) => layBaiTuVi(khoThu, c.ma, 'ngay', luc1).tinhCam)).size > 1,
  true
);

// --- bánh xe chọn ngày sinh ----------------------------------------------
// Tháng đủ, tháng thiếu, và cái bẫy năm nhuận.
kiem('thang 1 co 31 ngay', soNgayTrongThang(1, 2001), 31);
kiem('thang 4 co 30 ngay', soNgayTrongThang(4, 2001), 30);
kiem('thang 2 nam thuong co 28', soNgayTrongThang(2, 2001), 28);
kiem('thang 2 nam nhuan co 29', soNgayTrongThang(2, 2000), 29);
// 1900 chia het cho 100 ma khong chia het cho 400 nen khong phai nam nhuan.
kiem('thang 2 nam 1900 co 28', soNgayTrongThang(2, 1900), 28);
kiem('thang 2 nam 2024 co 29', soNgayTrongThang(2, 2024), 29);
kiem('thang 12 co 31 ngay', soNgayTrongThang(12, 1995), 31);

// Dang de 31 roi chuyen sang thang ngan hon thi phai keo ve cuoi thang.
kiem('31 sang thang 2 thuong', ngayHopLe(31, 2, 2001), 28);
kiem('31 sang thang 2 nhuan', ngayHopLe(31, 2, 2000), 29);
kiem('31 sang thang 4', ngayHopLe(31, 4, 2001), 30);
kiem('30 o thang 12 giu nguyen', ngayHopLe(30, 12, 2001), 30);
kiem('1 luon hop le', ngayHopLe(1, 2, 1900), 1);

// Khoang nam tren banh xe phai khop voi gioi han tuoi cua kiemNgaySinh.
const moc = new Date(2026, 5, 15);
kiem('nam som nhat la 120 tuoi', khoangNamSinh(moc).dau, 1906);
kiem('nam muon nhat la 18 tuoi', khoangNamSinh(moc).cuoi, 2008);
// Moi ngay deu phai co trong banh xe, khong duoc hut mat ngay nao.
{
  const k = khoangNamSinh(moc);
  let tong = 0;
  for (let n = k.dau; n <= k.cuoi; n++) {
    for (let t = 1; t <= 12; t++) tong += soNgayTrongThang(t, n);
  }
  // Doi chieu bang quy tac nam nhuan, doc lap voi cach Date dem o tren.
  let nhuan = 0;
  for (let n = k.dau; n <= k.cuoi; n++) {
    if ((n % 4 === 0 && n % 100 !== 0) || n % 400 === 0) nhuan++;
  }
  kiem('so nam nhuan trong khoang', nhuan, 26);
  kiem('tong so ngay chon duoc', tong, (k.cuoi - k.dau + 1) * 365 + nhuan);
}

// --- buoc nhay chon bai tu vi ------------------------------------------
// Nhip co dinh chi di het kho khi no khong chung uoc voi co kho. Co that:
// kho tong quan lon toi dung 31 cau, bang dung nhip 31, the la ngay nao cung
// ra mot bai. Kiem o day de khong tai dien khi kho lon them.
{
  const ucln = (a: number, b: number): number => (b === 0 ? a : ucln(b, a % b));
  let hong = 0;
  for (let co = 1; co <= 80; co++) {
    for (const nhip of [31, 37, 41, 43]) {
      const b = buocDi(nhip, co);
      if (ucln(b, co) !== 1) hong++;
      // Di du `co` buoc phai cham het moi o, khong duoc lap som.
      const cham = new Set<number>();
      for (let n = 0; n < co; n++) cham.add((n * b) % co);
      if (cham.size !== co) hong++;
    }
  }
  kiem('buoc nhay di het kho voi moi co tu 1 toi 80', hong, 0);
  // Ca hai truong hop tung lam hong that.
  kiem('co kho bang dung nhip', buocDi(31, 31) === 31, false);
  kiem('co kho la boi cua nhip', buocDi(31, 62) === 31, false);
}

// --- ty le la nguoc khi rut bai ------------------------------------------
// tarot.ts phai nap expo-crypto nen Node khong goi thang duoc. Doc hang so
// thang tu file nguon roi dung lai phep tinh, giong cach tu-vi.ts giu ban chep
// thu tu 12 cung va kiem lai o day.
{
  const nguon = readFileSync(new URL('../src/lib/tarot.ts', import.meta.url), 'utf8');

  const tyLe = Number(/export const TY_LE_NGUOC = ([\d.]+);/.exec(nguon)?.[1]);
  const moc = Number(/const MOC_32_BIT = (\d+);/.exec(nguon)?.[1]);
  kiem('doc duoc TY_LE_NGUOC tu tarot.ts', Number.isFinite(tyLe), true);
  kiem('MOC_32_BIT dung bang 2 mu 32', moc, 2 ** 32);

  // Ban dau la `% 2 === 0`, tuc 50%. Khi do cu hai lan rut ba la thi mot lan
  // khach nhan 2 hoac 3 la nguoc, nghia la gan nhu toan tin xau.
  kiem('khong con tung dong xu 50%', /% 2 === 0/.test(nguon), false);
  kiem('ty le nguoc nam trong khoang hop ly', tyLe > 0.15 && tyLe < 0.4, true);

  const a = new Uint32Array(3 * 2);
  const dem = [0, 0, 0, 0];
  const LAN = 60000;
  for (let i = 0; i < LAN; i++) {
    randomFillSync(a);
    let k = 0;
    for (let j = 0; j < 3; j++) if (a[j * 2 + 1] / moc < tyLe) k++;
    dem[k]++;
  }
  const haiTroLen = (dem[2] + dem[3]) / LAN;
  kiem('rut 3 la, it nhat 2 la nguoc duoi 30%', haiTroLen < 0.3, true);
  kiem('van con luc ra 3 la nguoc', dem[3] > 0, true);
}

console.log(loi === 0 ? '\n==> TAT CA DEU DUNG' : `\n==> CO ${loi} CHO SAI`);
process.exit(loi === 0 ? 0 : 1);
