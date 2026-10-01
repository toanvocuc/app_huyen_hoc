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

// Mã lá phải trùng tên file ảnh, không thì app hiện khung giữ chỗ.
const maSai = tren.filter((d) => !/^(major-\d{2}|(cups|wands|swords|pents)-\d{2})$/.test(d.ma));
ket(maSai.length === 0, 'mã lá khớp tên file ảnh', maSai.map((d) => d.ma).join(', '));

console.log(sai === 0 ? '\n==> DỮ LIỆU ĐÃ NẠP ĐÚNG' : `\n==> CÓ ${sai} CHỖ SAI`);
process.exit(sai === 0 ? 0 : 1);
