/**
 * Soát nội dung đã nạp lên máy chủ có khớp file gốc không.
 *
 * Chạy:  npm run soat-du-lieu
 *
 * Đếm số dòng thôi là chưa đủ: đường truyền có thể làm hỏng dấu tiếng Việt hoặc
 * cắt cụt ô dài mà số dòng vẫn đúng. Nên lệnh này đối chiếu từng chữ với file CSV.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { docCsv } from './doc-csv.mjs';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

const mt = Object.fromEntries(
  readFileSync(join(GOC, '.env'), 'utf8')
    .split('\n')
    .map((d) => d.trim())
    .filter((d) => d && !d.startsWith('#'))
    .map((d) => [d.slice(0, d.indexOf('=')).trim(), d.slice(d.indexOf('=') + 1).trim()])
);

if (!mt.EXPO_PUBLIC_SUPABASE_URL || !mt.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Thiếu khoá trong .env');
  process.exit(1);
}

const db = createClient(mt.EXPO_PUBLIC_SUPABASE_URL, mt.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

let sai = 0;
function ket(dat, ten, them = '') {
  if (!dat) sai++;
  console.log(`${dat ? 'OK  ' : 'SAI '} ${ten}${them ? ' — ' + them : ''}`);
}

// --- Đếm từng bảng ----------------------------------------------------------
for (const [bang, n] of [
  ['la_bai', 78],
  ['so_chu_dao', 12],
  ['so_van_menh', 12],
  ['cung_hoang_dao', 12],
  ['do_hop_cung', 78],
  ['mui_ten_bieu_do', 16],
  ['con_so_bieu_do', 9],
  ['tu_vi_mau', 252],
]) {
  const { count } = await db.from(bang).select('*', { count: 'exact', head: true });
  ket(count === n, `${bang} có ${n} dòng`, `đếm được ${count}`);
}

// --- Đối chiếu từng chữ với file gốc ----------------------------------------
const goc = docCsv(join(GOC, 'data', 'tarot_78_la.csv'));
const { data: tren } = await db.from('la_bai').select('*');
const theoMa = Object.fromEntries(tren.map((d) => [d.ma, d]));

const lech = goc.filter((g) => {
  const t = theoMa[g.ma];
  return (
    !t ||
    t.ten_vi !== g.ten_vi ||
    t.y_nghia_xuoi !== g.y_nghia_xuoi ||
    t.y_nghia_nguoc !== g.y_nghia_nguoc ||
    t.tinh_cam !== g.tinh_cam ||
    t.cong_viec !== g.cong_viec ||
    t.loi_khuyen !== g.loi_khuyen
  );
});
ket(lech.length === 0, 'nội dung 78 lá khớp file gốc từng chữ', lech.map((d) => d.ma).join(', '));

// Dấu tiếng Việt và dấu phẩy là hai thứ hay hỏng nhất khi truyền.
const thap = theoMa['major-16'];
ket(thap?.ten_vi === 'Tòa Tháp', 'dấu tiếng Việt còn nguyên', thap?.ten_vi);
ket(Boolean(thap?.y_nghia_xuoi.includes(',')), 'dấu phẩy trong ô còn nguyên');
ket(
  goc.every((g) => theoMa[g.ma]?.y_nghia_xuoi.length === g.y_nghia_xuoi.length),
  'không ô nào bị cắt cụt'
);

// --- Độ hợp -----------------------------------------------------------------
const { data: hop } = await db.from('do_hop_cung').select('*');
ket(hop.every((h) => h.diem >= 1 && h.diem <= 5), 'điểm hợp nằm trong 1 tới 5');
ket(new Set(hop.map((h) => `${h.cung_a}|${h.cung_b}`)).size === 78, 'không có cặp trùng');

// Mỗi cặp phải có bài riêng. Bản cũ dùng chung bốn câu theo điểm, khách xem hai
// cặp khác nhau là nhận ra ngay, nên đếm số bài khác nhau chứ không chỉ đếm dòng.
const soBai = new Set(hop.map((h) => h.loi_binh)).size;
ket(soBai === 78, '78 cặp có 78 bài khác nhau', `chỉ có ${soBai} bài`);

const thieuCot = hop.filter((h) => !h.diem_manh || !h.diem_yeu || !h.loi_khuyen);
ket(
  thieuCot.length === 0,
  'cặp nào cũng đủ điểm mạnh, điểm yếu và lời khuyên',
  `${thieuCot.length} cặp còn thiếu`
);

// Thang điểm cũ dồn 73% số cặp vào hai đầu 2 sao và 5 sao, mức 1 sao thì trống trơn.
const demDiem = {};
for (const h of hop) demDiem[h.diem] = (demDiem[h.diem] ?? 0) + 1;
ket(
  [1, 2, 3, 4, 5].every((d) => (demDiem[d] ?? 0) >= 10),
  'cả năm mức đều có ít nhất 10 cặp',
  JSON.stringify(demDiem)
);

// Mã lá phải trùng tên file ảnh, không thì app hiện khung giữ chỗ.
const maSai = tren.filter((d) => !/^(major-\d{2}|(cups|wands|swords|pents)-\d{2})$/.test(d.ma));
ket(maSai.length === 0, 'mã lá khớp tên file ảnh', maSai.map((d) => d.ma).join(', '));

// --- Biểu đồ ngày sinh -------------------------------------------------------
// Tám đường thẳng, mỗi đường phải có đủ hai bản: một bản khi đủ ba số, một bản
// khi trống cả ba. Thiếu một bản là màn biểu đồ hiện ô trắng đúng lúc khách đọc.
const DUONG = ['1-5-9', '3-5-7', '3-6-9', '2-5-8', '1-4-7', '1-2-3', '4-5-6', '7-8-9'];
const { data: muiTen } = await db.from('mui_ten_bieu_do').select('*');
const thieuMt = [];
for (const d of DUONG) {
  for (const loai of ['day', 'trong']) {
    if (!muiTen.some((m) => m.cac_so === d && m.loai === loai)) thieuMt.push(`${loai}-${d}`);
  }
}
ket(thieuMt.length === 0, 'đủ 16 mũi tên biểu đồ', thieuMt.join(', '));

const { data: conSo } = await db.from('con_so_bieu_do').select('*');
const thieuCs = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !conSo.some((c) => c.so === n));
ket(thieuCs.length === 0, 'đủ chín con số trong ô vuông', thieuCs.join(', '));

// --- Tử vi ngày và tuần ------------------------------------------------------
// Thiếu bài cho một cung là cung đó mở ra trống trơn, mà chỉ khách thuộc cung đó
// mới thấy, nên lỗi kiểu này rất lâu mới có người báo.
const { data: tv } = await db.from('tu_vi_mau').select('*');
const MA_CUNG = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];
const thieuTuVi = [];
for (const ky of ['ngay', 'tuan']) {
  for (const c of MA_CUNG) {
    const n = tv.filter((x) => x.ky === ky && x.muc === 'tong_quan' && x.cung === c).length;
    if (n < 5) thieuTuVi.push(`${ky}/${c} chỉ có ${n}`);
  }
  for (const muc of ['tinh_cam', 'cong_viec']) {
    const n = tv.filter((x) => x.ky === ky && x.muc === muc && x.cung === 'chung').length;
    if (n < 5) thieuTuVi.push(`${ky}/${muc} chỉ có ${n}`);
  }
}
ket(thieuTuVi.length === 0, 'cung nào cũng đủ bài tử vi ngày và tuần', thieuTuVi.join(', '));

// Kho các mục phải lệch nhau về số lượng. Bằng nhau thì tổ hợp lặp lại rất nhanh
// và khách đọc mỗi sáng sẽ nhận ra ngay.
const coKho = ['tinh_cam', 'cong_viec', 'suc_khoe'].map(
  (m) => tv.filter((x) => x.ky === 'ngay' && x.muc === m).length
);
ket(
  new Set(coKho).size === coKho.length,
  'ba kho của bản ngày lệch nhau về số lượng',
  coKho.join(' / ')
);

// --- Bảng có đủ cột mà app ghi vào không ------------------------------------
// Thiếu một cột thôi là mọi lần lưu đều hỏng, mà lỗi chỉ lộ lúc chạy thật trên máy.
// Đây đúng là chỗ đã sót cột noi_sinh ở file tạo bảng đầu tiên.
const COT_CAN = {
  ho_so: [
    'nguoi_dung', 'ho_ten', 'ngay_sinh', 'gio_sinh', 'noi_sinh', 'gioi_tinh',
    'gio_nhac', 'nhac_la_bai', 'nhac_tin_tuc',
  ],
  thiet_bi: ['ma_day', 'nguoi_dung', 'nen_tang'],
  lan_rut: ['nguoi_dung', 'kieu_trai', 'cac_la', 'cau_hoi'],
  su_kien: ['nguoi_dung', 'loai', 'man_hinh', 'ma_theo_doi'],
};

for (const [bang, cot] of Object.entries(COT_CAN)) {
  // Chọn đích danh từng cột: thiếu cột nào thì Postgres gọi tên cột đó ra.
  const { error } = await db.from(bang).select(cot.join(',')).limit(0);
  ket(!error, `${bang} đủ ${cot.length} cột app cần`, error?.message ?? '');
}

console.log(sai === 0 ? '\n==> DỮ LIỆU ĐÃ NẠP ĐÚNG' : `\n==> CÓ ${sai} CHỖ SAI`);
process.exit(sai === 0 ? 0 : 1);
