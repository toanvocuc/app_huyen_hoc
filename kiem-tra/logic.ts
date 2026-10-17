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
// Doi ten `moc` vi file nay da co mot bien moc khac, la moc 32 bit.
import {
  gioBatDau,
  gioDoc,
  gioSomNhat,
  hetGioHomNay,
  khungConDat,
  moc as mocGio,
  mocNhac,
  tachGioHen,
} from '../src/lib/nhac-hen-gio.ts';
// Doi ten `layMa` cho khoi lan voi bien khac trong file.
import { dongBacGia, dungTinNhan, giaKemDonVi, giaTheoSoLuong, tien, tongTien } from '../src/lib/gian-hang.ts';
import { cauThieu, thieuHoSo } from '../src/lib/ho-so-thieu.ts';
import { donDuocDon, maDonDuocDon, tachDonGhim } from '../src/lib/don-loc.ts';
import { docLoi, laKhachTuChoi, laTrungDanhTinh, layMa as layMaTraVe } from '../src/lib/duong-tra-ve.ts';

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

// Ba muc tinh_cam, cong_viec, suc_khoe khong co bai rieng cho tung cung: ca 12
// cung boc chung mot ro. Vay ma van phai ra 12 bai khac nhau, khong ngay nao trung.
//
// Truoc day phan theo cung dung ham bam. Bam thi hai cung khac nhau van co the
// cho cung mot so du, nen do thuc te moi ngay co chung hai trong muoi hai cung
// doc ra chu y het. Hai nguoi ban khac cung ngoi so dien thoai la thay.
const khoChung = lam('tinh_cam', 'chung', 30);
let soNgayTrung = 0;
for (let i = 0; i < 400; i++) {
  const luc = new Date(Date.UTC(2026, 0, 1 + i, 5));
  const bai = CUNG.map((c) => layBaiTuVi(khoChung, c.ma, 'ngay', luc).tinhCam);
  if (new Set(bai).size !== 12) soNgayTrung++;
}
kiem('mot ro dung chung: 12 cung khong trung, do 400 ngay', soNgayTrung, 0);

// Cung mot cung thi doi ngay van phai doi bai, dung de viec gian 12 cung lam hong
// phan di theo ngay.
const theoNgay = Array.from({ length: 30 }, (_, i) =>
  layBaiTuVi(khoChung, 'leo', 'ngay', new Date(Date.UTC(2026, 0, 1 + i, 5))).tinhCam
);
kiem('mot cung, 30 ngay lien ra 30 bai khac nhau', new Set(theoNgay).size, 30);

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


// ---------------------------------------------------------------- nhắc trước buổi hẹn

console.log('\n--- giờ bắt đầu, suy từ chính chuỗi khách chọn ---');
kiem('Sáng 9h', gioBatDau('Sáng, 9h tới 11h'), 9);
kiem('Chiều 14h', gioBatDau('Chiều, 14h tới 16h'), 14);
kiem('Tối 19h', gioBatDau('Tối, 19h tới 21h'), 19);
// Không có số nào thì về 9h, không được trả NaN rồi hẹn vào hư không.
kiem('giờ nào cũng được -> 9h', gioBatDau('Giờ nào cũng được'), 9);
kiem('chuỗi lạ -> 9h', gioBatDau('bất kỳ'), 9);
// Khách chọn giờ chính xác thì ô khung_gio nhận luôn chuỗi 'HH:mm'.
kiem("hiểu cả dạng 13:45", gioBatDau('13:45'), 13);

console.log('\n--- dựng mốc theo giờ MÁY, không qua UTC ---');
// Chỗ sập nếu lỡ dùng new Date('2026-10-22'): ở Việt Nam sẽ ra 21/10.
const m1 = mocGio('2026-10-22', 19);
kiem('ngày đúng', m1 ? m1.getDate() : null, 22);
kiem('tháng đúng', m1 ? m1.getMonth() + 1 : null, 10);
kiem('giờ đúng', m1 ? m1.getHours() : null, 19);
kiem('ngày 31/2 bị bắt', mocGio('2026-02-31', 9), null);
kiem('chuỗi rỗng bị bắt', mocGio('', 9), null);

console.log('\n--- hai mốc nhắc ---');
const h = mocNhac('2026-10-22', 'Tối, 19h tới 21h');
kiem('nhắc hôm trước đúng ngày 21', h ? h.homTruoc.getDate() : null, 21);
kiem('nhắc hôm trước lúc 20h', h ? h.homTruoc.getHours() : null, 20);
kiem('nhắc gần giờ: 18h', h ? h.truocMotTieng.getHours() : null, 18);
kiem('nhắc gần giờ: đúng ngày 22', h ? h.truocMotTieng.getDate() : null, 22);

// Hẹn mùng 1 thì lời nhắc hôm trước phải lùi sang tháng trước.
const h2 = mocNhac('2026-11-01', 'Sáng, 9h tới 11h');
kiem('mùng 1: nhắc trước là 31/10', h2 ? `${h2.homTruoc.getDate()}/${h2.homTruoc.getMonth() + 1}` : null, '31/10');
kiem('mùng 1: nhắc gần là 8h', h2 ? h2.truocMotTieng.getHours() : null, 8);

// Hẹn 9h sáng thì "trước một tiếng" là 8h CÙNG ngày, không được tụt sang hôm trước.
const h3 = mocNhac('2026-10-22', 'Giờ nào cũng được');
kiem('9h: nhắc gần vẫn cùng ngày', h3 ? h3.truocMotTieng.getDate() : null, 22);

// Hẹn 1/1 thì lùi sang năm trước.
const h4 = mocNhac('2027-01-01', 'Tối, 19h tới 21h');
kiem('1/1: nhắc trước là 31/12/2026', h4 ? `${h4.homTruoc.getDate()}/${h4.homTruoc.getMonth() + 1}/${h4.homTruoc.getFullYear()}` : null, '31/12/2026');


console.log('\n--- giờ hẹn chính xác ---');
kiem('13:00 tách được', tachGioHen('13:00'), { gio: 13, phut: 0 });
kiem('09:45 tách được', tachGioHen('09:45'), { gio: 9, phut: 45 });
kiem('rỗng -> null', tachGioHen(''), null);
kiem('null -> null', tachGioHen(null), null);
kiem('24:00 bị chặn', tachGioHen('24:00'), null);
kiem('12:60 bị chặn', tachGioHen('12:60'), null);
kiem('chuỗi lạ bị chặn', tachGioHen('chiều'), null);
kiem('hiện ra 13:00', gioDoc('13:00'), '13:00');
kiem('không có giờ thì null', gioDoc(null), null);

// Có giờ chính xác thì lời nhắc phải bám theo nó, KHÔNG theo khung giờ.
const g1 = mocNhac('2026-10-22', 'Chiều, 14h tới 16h', '13:00');
kiem('nhắc gần = 12h, không phải 13h theo khung', g1 ? g1.truocMotTieng.getHours() : null, 12);
kiem('nhắc gần đúng ngày 22', g1 ? g1.truocMotTieng.getDate() : null, 22);
kiem('nhắc hôm trước vẫn 20h ngày 21', g1 ? `${g1.homTruoc.getDate()} ${g1.homTruoc.getHours()}` : null, '21 20');

// Giờ chính xác có phút lẻ.
const g2 = mocNhac('2026-10-22', 'Tối, 19h tới 21h', '19:30');
kiem('19:30 -> nhắc lúc 18:30', g2 ? `${g2.truocMotTieng.getHours()}:${g2.truocMotTieng.getMinutes()}` : null, '18:30');

// Giờ chính xác sai khuôn thì lùi về khung giờ, không được vỡ.
const g3 = mocNhac('2026-10-22', 'Tối, 19h tới 21h', 'bậy');
kiem('giờ sai khuôn thì dùng khung', g3 ? g3.truocMotTieng.getHours() : null, 18);

// Giờ chính xác sớm, 00:30, thì nhắc lùi sang hôm trước.
const g4 = mocNhac('2026-10-22', 'Sáng, 9h tới 11h', '00:30');
kiem('00:30 -> nhắc 23:30 hôm trước', g4 ? `${g4.truocMotTieng.getDate()} ${g4.truocMotTieng.getHours()}:${g4.truocMotTieng.getMinutes()}` : null, '21 23:30');


console.log('\n--- khoảng giờ còn đặt được ---');
// Ngày khác hôm nay thì cứ từ 9 giờ, bất kể bây giờ là mấy giờ.
kiem('ngày mai, bây giờ 20h -> 9', gioSomNhat('2026-10-20', new Date(2026, 9, 19, 20, 0)), 9);
kiem('ngày mai, bây giờ 3h sáng -> 9', gioSomNhat('2026-10-20', new Date(2026, 9, 19, 3, 0)), 9);

// Hôm nay thì lùi theo đồng hồ, cộng một tiếng đặt trước.
kiem('hôm nay 6h sáng -> vẫn 9', gioSomNhat('2026-10-19', new Date(2026, 9, 19, 6, 0)), 9);
kiem('hôm nay 8h -> 9', gioSomNhat('2026-10-19', new Date(2026, 9, 19, 8, 30)), 9);
kiem('hôm nay 14h -> 15', gioSomNhat('2026-10-19', new Date(2026, 9, 19, 14, 10)), 15);
kiem('hôm nay 20h -> 21', gioSomNhat('2026-10-19', new Date(2026, 9, 19, 20, 0)), 21);

// Quá giờ thì hôm nay hết chỗ.
kiem('hôm nay 21h -> 22, quá giờ muộn nhất', gioSomNhat('2026-10-19', new Date(2026, 9, 19, 21, 0)), 22);
kiem('hôm nay 8h: chưa hết giờ', hetGioHomNay('2026-10-19', new Date(2026, 9, 19, 8, 0)), false);
kiem('hôm nay 20h: chưa hết giờ', hetGioHomNay('2026-10-19', new Date(2026, 9, 19, 20, 0)), false);
kiem('hôm nay 21h: HẾT giờ', hetGioHomNay('2026-10-19', new Date(2026, 9, 19, 21, 0)), true);
kiem('hôm nay 23h: HẾT giờ', hetGioHomNay('2026-10-19', new Date(2026, 9, 19, 23, 0)), true);
kiem('ngày mai thì không bao giờ hết', hetGioHomNay('2026-10-20', new Date(2026, 9, 19, 23, 0)), false);

console.log('\n--- khung giờ cho sẵn còn đặt được không ---');
const n8 = new Date(2026, 9, 19, 8, 0);
const n20 = new Date(2026, 9, 19, 20, 0);
kiem('8h sáng: khung Sáng còn đặt', khungConDat('Sáng, 9h tới 11h', '2026-10-19', n8), true);
kiem('8h sáng: khung Tối còn đặt', khungConDat('Tối, 19h tới 21h', '2026-10-19', n8), true);
// Đây là ca user báo: 8 giờ tối mà vẫn chọn được khung sáng của hôm nay.
kiem('20h: khung Sáng ĐÃ TRÔI QUA', khungConDat('Sáng, 9h tới 11h', '2026-10-19', n20), false);
kiem('20h: khung Chiều ĐÃ TRÔI QUA', khungConDat('Chiều, 14h tới 16h', '2026-10-19', n20), false);
kiem('20h: khung Tối vẫn còn', khungConDat('Tối, 19h tới 21h', '2026-10-19', n20), true);
// Ngày mai thì khung nào cũng còn.
kiem('20h hôm nay, khung Sáng NGÀY MAI vẫn còn', khungConDat('Sáng, 9h tới 11h', '2026-10-20', n20), true);
// 'Giờ nào cũng được' quy về 9h nên cũng trôi qua như khung sáng.
// 'Giờ nào cũng được' kéo tới giờ muộn nhất nên 20h vẫn còn đặt được.
kiem('20h: giờ nào cũng được vẫn còn', khungConDat('Giờ nào cũng được', '2026-10-19', n20), true);


// ---------------------------------------------------------------- địa chỉ OAuth trả về

console.log('\n--- bóc mã đăng nhập ---');
kiem('mã sau dấu hỏi', layMaTraVe('omora://dang-nhap-xong?code=abc123'), 'abc123');
kiem('mã sau dấu thăng', layMaTraVe('omora://dang-nhap-xong#code=abc123'), 'abc123');
// Chỗ cách cũ sập: có sẵn dấu hỏi rồi mới tới dấu thăng.
kiem(
  'có cả hỏi lẫn thăng',
  layMaTraVe('omora://dang-nhap-xong?x=1#code=abc123'),
  'abc123'
);
kiem('không có mã', layMaTraVe('omora://dang-nhap-xong'), null);

console.log('\n--- đọc lỗi Supabase nhét trong địa chỉ ---');
const trung =
  'omora://dang-nhap-xong?error=server_error&error_code=identity_already_exists' +
  '&error_description=Identity+is+already+linked+to+another+user';
const l1 = docLoi(trung);
kiem('nhận ra có lỗi', l1 !== null, true);
kiem('lấy đúng mã lỗi', l1 ? l1.ma : null, 'identity_already_exists');
kiem('dấu cộng thành dấu cách', l1 ? l1.ta : null, 'Identity is already linked to another user');
kiem('đúng là trùng danh tính', l1 ? laTrungDanhTinh(l1.ma, l1.ta) : false, true);

// Cùng nội dung nhưng trả sau dấu thăng.
const l2 = docLoi('omora://dang-nhap-xong#error_code=identity_already_exists&error_description=x');
kiem('lỗi sau dấu thăng cũng đọc được', l2 ? laTrungDanhTinh(l2.ma, l2.ta) : false, true);

// Khách bấm từ chối ở trang Google.
const l3 = docLoi('omora://dang-nhap-xong?error=access_denied&error_description=User+denied');
kiem('khách từ chối', l3 ? laKhachTuChoi(l3.ma, l3.ta) : false, true);
kiem('từ chối KHÔNG phải trùng danh tính', l3 ? laTrungDanhTinh(l3.ma, l3.ta) : true, false);

// Địa chỉ chạy trót lọt thì không được báo lỗi.
kiem('địa chỉ có mã thì không có lỗi', docLoi('omora://dang-nhap-xong?code=abc'), null);
kiem('địa chỉ trơn thì không có lỗi', docLoi('omora://dang-nhap-xong'), null);

// Chỉ có error chung chung, không có error_code.
const l4 = docLoi('omora://dang-nhap-xong?error=server_error');
kiem('lấy được error khi thiếu error_code', l4 ? l4.ma : null, 'server_error');


console.log('\n--- ghim don tu thong bao, va don bot don da khep lai ---');
{
  type D = { ma: string; trang_thai: string };
  const ds: D[] = [
    { ma: 'a', trang_thai: 'cho_nhan' },
    { ma: 'b', trang_thai: 'da_nhan' },
    { ma: 'c', trang_thai: 'da_xong' },
    { ma: 'd', trang_thai: 'da_huy' },
  ];

  // Khong co ma thi khong ghim gi, va danh sach phai la DUNG mang dang hien.
  const k0 = tachDonGhim(ds, ds, null);
  kiem('khong co ma thi khong ghim', k0.ghim, null);
  kiem('khong co ma thi giu nguyen danh sach', k0.conLai.length, 4);

  const k1 = tachDonGhim(ds, ds, 'c');
  kiem('ghim dung don', k1.ghim ? k1.ghim.ma : null, 'c');
  kiem('don da ghim khong con trong danh sach', k1.conLai.some((x) => x.ma === 'c'), false);
  kiem('ba don con lai van nguyen', k1.conLai.length, 3);

  // Day du co, dang hien khong co: van phai ghim duoc.
  // Day la ca o tim kiem dang loc mat don can tim.
  const locHet = ds.filter((x) => x.ma === 'a');
  const k2 = tachDonGhim(ds, locHet, 'd');
  kiem('loc mat van ghim duoc', k2.ghim ? k2.ghim.ma : null, 'd');
  kiem('danh sach dang hien khong bi dong them gi', k2.conLai.length, 1);

  // Ma tro toi mot don khong con ton tai: khong ghim, va khong duoc nuot don nao.
  const k3 = tachDonGhim(ds, ds, 'khong-co');
  kiem('ma la thi khong ghim', k3.ghim, null);
  kiem('ma la thi khong mat don nao', k3.conLai.length, 4);

  // Don duoc don: chi da_xong va da_huy.
  kiem('dem dung so don don duoc', maDonDuocDon(ds).length, 2);
  kiem('don duoc gom c va d', maDonDuocDon(ds).join(','), 'c,d');
  kiem('khong don don dang cho', maDonDuocDon(ds).includes('a'), false);
  kiem('khong don don da nhan', maDonDuocDon(ds).includes('b'), false);
  kiem('danh sach rong thi khong co gi de don', maDonDuocDon([]).length, 0);

  // donDuocDon dung voi mot don le, dung cho nut trong tung the.
  kiem('mot don da xong thi don duoc', donDuocDon([ds[2]]).length, 1);
  kiem('mot don cho nhan thi khong', donDuocDon([ds[0]]).length, 0);
}

console.log('\n--- gia va bac gia theo so luong ---');
{
  const bac = [{ tu: 10, gia: 249000 }];

  kiem('viet tien co dau cham', tien(280000), '280.000đ');
  kiem('viet tien bac trieu', tien(4660000), '4.660.000đ');
  kiem('gia kem don vi', giaKemDonVi(280000, 'vòng'), '280.000đ / vòng');

  // Chua toi nguong thi van gia goc.
  kiem('mua 1 thi gia goc', giaTheoSoLuong(280000, bac, 1), 280000);
  kiem('mua 9 van gia goc', giaTheoSoLuong(280000, bac, 9), 280000);
  // Dung bang nguong la duoc huong.
  kiem('mua dung 10 thi duoc gia bac', giaTheoSoLuong(280000, bac, 10), 249000);
  kiem('mua 50 van gia bac do', giaTheoSoLuong(280000, bac, 50), 249000);
  // Khong co bac thi khong doi gi.
  kiem('khong co bac gia', giaTheoSoLuong(230000, null, 100), 230000);
  kiem('bac gia rong', giaTheoSoLuong(230000, [], 100), 230000);

  // Nhieu bac, va CO Y dat sai thu tu trong du lieu: bang gia do nguoi nhap tay.
  const nhieu = [{ tu: 500, gia: 60000 }, { tu: 50, gia: 64000 }];
  kiem('nhieu bac: 10 chua toi nguong nao', giaTheoSoLuong(70000, nhieu, 10), 70000);
  kiem('nhieu bac: 50 an bac giua', giaTheoSoLuong(70000, nhieu, 50), 64000);
  kiem('nhieu bac: 499 van bac giua', giaTheoSoLuong(70000, nhieu, 499), 64000);
  kiem('nhieu bac: 500 an bac thap nhat', giaTheoSoLuong(70000, nhieu, 500), 60000);
  kiem('nhieu bac: 900 an bac thap nhat', giaTheoSoLuong(70000, nhieu, 900), 60000);

  // Dong chu mo ta bac, luon xep tu nguong nho len.
  kiem('dong bac gia mot bac', dongBacGia(bac, 'vòng').join(' | '), 'Từ 10 vòng: 249.000đ');
  kiem('dong bac gia xep lai tu nho',
    dongBacGia(nhieu, 'kg').join(' | '),
    'Từ 50 kg: 64.000đ | Từ 500 kg: 60.000đ');
  kiem('khong co bac thi khong co dong nao', dongBacGia(null, 'bộ').length, 0);
}

console.log('\n--- tin nhan gui cho cua hang ---');
{
  const luc = new Date(2026, 9, 18, 9, 5); // 18/10 09:05
  const mon = [
    { ten: 'Vòng Lam Ngọc Jade type A', soLuong: 10, gia: 280000, donVi: 'vòng', bacGia: [{ tu: 10, gia: 249000 }] },
    { ten: 'Bát tụ bảo Ngọc Hoàng Long chữ Phát Tài', soLuong: 1, gia: 360000, donVi: 'bộ', bacGia: [{ tu: 5, gia: 320000 }] },
  ];

  // 10 vong x 249.000 = 2.490.000 ; 1 bo x 360.000 (chua toi 5 bo) = 360.000
  kiem('tong tien an dung bac gia', tongTien(mon), 2490000 + 360000);

  const chu = dungTinNhan(mon, luc);
  kiem('co dong gio ngan', chu.indexOf('18/10 09:05') >= 0, true);
  kiem('co don gia da ha theo bac', chu.indexOf('10 vòng x 249.000đ = 2.490.000đ') >= 0, true);
  kiem('mon chua toi nguong van gia goc', chu.indexOf('1 bộ x 360.000đ = 360.000đ') >= 0, true);
  kiem('co dong tam tinh', chu.indexOf('Tạm tính: 2.850.000đ') >= 0, true);
  // Cau cuoi phai la mot cau HOI, khong phai lenh dat hang.
  kiem('ket bang cau hoi them', chu.indexOf('Mình muốn hỏi thêm về mấy món này.') >= 0, true);
  kiem('khong co chu "dat hang"', /đặt hàng|đơn hàng|thanh toán/i.test(chu), false);

  kiem('danh sach rong thi khong co chu nao', dungTinNhan([], luc), '');
  kiem('tong cua danh sach rong la 0', tongTien([]), 0);
}

console.log('\n--- ho so con thieu gi truoc khi dat lich ---');
{
  const du = { ho_ten: 'Đào', ngay_sinh: '1995-09-16', gio_sinh: '07:30', noi_sinh: 'Hà Nội' };
  kiem('ho so day du thi khong thieu gi', thieuHoSo(du).length, 0);

  // Khach an danh chua khai gi: thieu het, va phai dung thu tu uu tien.
  kiem('chua co ho so thi thieu het', thieuHoSo(null).join(', '),
    'họ tên, ngày sinh, giờ sinh, nơi sinh');
  kiem('ho so rong cung vay', thieuHoSo({}).join(', '),
    'họ tên, ngày sinh, giờ sinh, nơi sinh');

  // Hai o luong nhap ho so cho phep bo qua.
  kiem('thieu moi gio sinh', thieuHoSo({ ...du, gio_sinh: null }).join(', '), 'giờ sinh');
  kiem('thieu gio va noi sinh', thieuHoSo({ ...du, gio_sinh: null, noi_sinh: null }).join(', '),
    'giờ sinh, nơi sinh');

  // Chuoi toan dau cach khong tinh la da dien.
  kiem('ten toan dau cach van la thieu', thieuHoSo({ ...du, ho_ten: '   ' }).join(', '), 'họ tên');
  kiem('ten rong van la thieu', thieuHoSo({ ...du, ho_ten: '' }).join(', '), 'họ tên');

  // Ghep thanh cau doc duoc.
  kiem('cau rong', cauThieu([]), '');
  kiem('mot muc', cauThieu(['họ tên']), 'họ tên');
  kiem('hai muc dung chu va', cauThieu(['họ tên', 'ngày sinh']), 'họ tên và ngày sinh');
  kiem('ba muc: phay roi va', cauThieu(['họ tên', 'ngày sinh', 'giờ sinh']),
    'họ tên, ngày sinh và giờ sinh');
  kiem('bon muc', cauThieu(thieuHoSo(null)), 'họ tên, ngày sinh, giờ sinh và nơi sinh');
}

console.log(loi === 0 ? '\n==> TAT CA DEU DUNG' : `\n==> CO ${loi} CHO SAI`);
process.exit(loi === 0 ? 0 : 1);
