/**
 * Nạp các file CSV trong data/ vào cơ sở dữ liệu.
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
const SO = new Set(['so', 'diem', 'thu_tu']);

/**
 * Cột nào trong CSV thì bỏ, vì bảng không có.
 *
 * do_hop_cung.csv có sẵn ten_a và ten_b cho người đọc file dễ hiểu, nhưng bảng
 * không giữ hai cột đó: tên cung đã nằm ở cung_hoang_dao rồi. Chép sang đây là
 * lưu hai lần một thứ, sửa tên cung ở một chỗ thì chỗ kia sai theo.
 */
const BO_COT = { do_hop_cung: ['ten_a', 'ten_b'] };

const BANG = [
  ['la_bai', 'tarot_78_la.csv'],
  ['so_chu_dao', 'so_chu_dao.csv'],
  ['so_van_menh', 'so_van_menh.csv'],
  ['cung_hoang_dao', 'cung_hoang_dao.csv'],
  ['do_hop_cung', 'do_hop_cung.csv'],
  ['mui_ten_bieu_do', 'mui_ten_bieu_do.csv'],
  ['con_so_bieu_do', 'con_so_bieu_do.csv'],
  ['tu_vi_mau', 'tu_vi_mau.csv'],
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
  const bo = BO_COT[bang] ?? [];
  const dong = docCsv(join(GOC, 'data', file)).map((d) => {
    const ra = {};
    for (const [k, v] of Object.entries(d)) {
      if (bo.includes(k)) continue;
      ra[k] = SO.has(k) ? Number(v) : v;
    }
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

// ---------------------------------------------------------------- app có đọc được không
//
// Nạp bằng khoá quản trị thì bỏ qua khoá dòng, nên "nạp xong" KHÔNG có nghĩa là
// app đọc được. Bảng tu_vi_mau đã dính đúng chuyện đó: 252 dòng nằm trong bảng
// mà đọc bằng khoá công khai ra 0, vì câu tạo luật cho đọc chưa chạy. Mục tử vi
// hiện trống trơn với mọi khách, và chỉ lộ ra lúc mở app lên xem.
//
// Nên đọc lại một lượt bằng đúng khoá mà app cầm.
const moiTruongApp = docMoiTruong('.env');
const khoaApp = moiTruongApp.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (khoaApp) {
  console.log('\nĐọc lại bằng khoá công khai, đúng khoá mà app dùng:');
  const nhuApp = createClient(mt.SUPABASE_URL, khoaApp, { auth: { persistSession: false } });
  for (const [bang] of BANG) {
    const { count, error } = await nhuApp.from(bang).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`SAI   ${bang.padEnd(16)} ${error.message}`);
      hong++;
    } else if (!count) {
      console.log(`SAI   ${bang.padEnd(16)} app đọc ra 0 dòng, thiếu luật cho đọc trong khoá dòng`);
      hong++;
    } else {
      console.log(`OK    ${bang.padEnd(16)} app đọc được ${count} dòng`);
    }
  }
} else {
  console.log('\nKhông thấy EXPO_PUBLIC_SUPABASE_ANON_KEY trong .env nên bỏ qua bước kiểm bằng khoá app.');
}

console.log(hong === 0 ? '\n==> Nạp xong' : `\n==> Có ${hong} chỗ lỗi`);
process.exit(hong === 0 ? 0 : 1);
