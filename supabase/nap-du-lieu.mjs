/**
 * Nạp sáu file CSV trong data/ vào cơ sở dữ liệu.
 *
 * Chạy:  node supabase/nap-du-lieu.mjs
 *
 * Cần khoá quản trị vì các bảng nội dung chỉ cho đọc, không cho ghi từ app.
 * Khoá đó đọc từ .env.quan-tri, file này nằm trong .gitignore và KHÔNG BAO GIỜ
 * được đưa vào app.
 */

import { createClient } from '@supabase/supabase-js';

import { docCsv } from './doc-csv.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Đọc .env.quan-tri thành object, bỏ dòng trống và dòng chú thích. */
function docMoiTruong(ten) {
  let noiDung;
  try {
    noiDung = readFileSync(join(GOC, ten), 'utf8');
  } catch {
    console.error(
      `Thiếu file ${ten}. Tạo file đó ở thư mục gốc dự án với hai dòng:\n` +
        '  SUPABASE_URL=https://xxxx.supabase.co\n' +
        '  SUPABASE_SERVICE_ROLE_KEY=...'
    );
    process.exit(1);
  }
  const ra = {};
  for (const dong of noiDung.split('\n')) {
    const sach = dong.trim();
    if (!sach || sach.startsWith('#')) continue;
    const i = sach.indexOf('=');
    if (i > 0) ra[sach.slice(0, i).trim()] = sach.slice(i + 1).trim();
  }
  return ra;
}

/** Cột nào là số thì đổi kiểu, không thì Postgres báo lỗi. */
const SO = new Set(['so', 'diem']);

const BANG = [
  ['la_bai', 'tarot_78_la.csv'],
  ['so_chu_dao', 'so_chu_dao.csv'],
  ['so_van_menh', 'so_van_menh.csv'],
  ['cung_hoang_dao', 'cung_hoang_dao.csv'],
  ['do_hop_cung', 'do_hop_cung.csv'],
];

const mt = docMoiTruong('.env.quan-tri');
if (!mt.SUPABASE_URL || !mt.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.quan-tri');
  process.exit(1);
}

const db = createClient(mt.SUPABASE_URL, mt.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let hong = 0;
for (const [bang, file] of BANG) {
  const dong = docCsv(join(GOC, 'data', file)).map((d) => {
    const ra = {};
    for (const [k, v] of Object.entries(d)) ra[k] = SO.has(k) ? Number(v) : v;
    return ra;
  });

  // upsert để chạy lại nhiều lần không sinh bản trùng.
  const { error } = await db.from(bang).upsert(dong);
  if (error) {
    console.log(`SAI   ${bang.padEnd(16)} ${error.message}`);
    hong++;
    continue;
  }

  const { count } = await db.from(bang).select('*', { count: 'exact', head: true });
  console.log(`OK    ${bang.padEnd(16)} nạp ${dong.length} dòng, bảng đang có ${count}`);
}

console.log(hong === 0 ? '\n==> Nạp xong' : `\n==> Có ${hong} bảng lỗi`);
process.exit(hong === 0 ? 0 : 1);
