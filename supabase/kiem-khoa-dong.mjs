/**
 * Kiểm khoá dòng dữ liệu bằng đúng khoá công khai mà app dùng.
 *
 * Chạy:  node supabase/kiem-khoa-dong.mjs
 *
 * Đây là bước không được bỏ. Khoá công khai nằm sẵn trong app, ai tải về cũng moi
 * ra được. Nếu một bảng chưa bật khoá dòng thì người đó đọc được toàn bộ bảng,
 * gồm họ tên và ngày sinh của mọi khách.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

function docMoiTruong(ten) {
  let noiDung;
  try {
    noiDung = readFileSync(join(GOC, ten), 'utf8');
  } catch {
    console.error(`Thiếu file ${ten}`);
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

const mt = docMoiTruong('.env');
const url = mt.EXPO_PUBLIC_SUPABASE_URL;
const khoa = mt.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !khoa) {
  console.error('Thiếu EXPO_PUBLIC_SUPABASE_URL hoặc EXPO_PUBLIC_SUPABASE_ANON_KEY trong .env');
  process.exit(1);
}

const db = createClient(url, khoa, { auth: { persistSession: false } });

let sai = 0;
function ket(dat, ten, them = '') {
  if (!dat) sai++;
  console.log(`${dat ? 'OK  ' : 'SAI '} ${ten}${them ? ' — ' + them : ''}`);
}

console.log('Kiểm bằng khoá công khai, chưa đăng nhập\n');

// --- Bảng nội dung: ai cũng phải đọc được, nhưng không ai ghi được -------------
for (const bang of ['la_bai', 'so_chu_dao', 'so_van_menh', 'cung_hoang_dao', 'do_hop_cung']) {
  const { data, error } = await db.from(bang).select('*').limit(1);
  ket(!error && data?.length === 1, `đọc được ${bang}`, error?.message ?? '');
}

const { error: loiGhi } = await db.from('la_bai').insert({
  ma: 'thu-xoa-di',
  bo: 'Cốc',
  so: 99,
  ten_vi: 'x',
  ten_en: 'x',
  tu_khoa: 'x',
  y_nghia_xuoi: 'x',
  y_nghia_nguoc: 'x',
  tinh_cam: 'x',
  cong_viec: 'x',
  loi_khuyen: 'x',
});
ket(Boolean(loiGhi), 'KHÔNG ghi được vào la_bai', loiGhi ? '' : 'ghi được, là lỗ hổng');

// --- Bảng dữ liệu riêng: chưa đăng nhập thì không thấy dòng nào --------------
for (const bang of ['ho_so', 'lan_rut', 'su_kien']) {
  const { data, error } = await db.from(bang).select('*').limit(5);
  // Khoá dòng ăn thì trả về mảng rỗng, không phải báo lỗi.
  const dat = !error && Array.isArray(data) && data.length === 0;
  ket(dat, `KHÔNG đọc được ${bang} của người khác`,
      error ? error.message : data?.length ? `đọc được ${data.length} dòng, LỖ HỔNG` : '');
}

// --- Thử với một tài khoản ẩn danh: chỉ thấy dòng của chính mình -------------
const { data: phien, error: loiDangNhap } = await db.auth.signInAnonymously();
if (loiDangNhap) {
  console.log(`\nSAI  đăng nhập ẩn danh — ${loiDangNhap.message}`);
  console.log('     Bật ở Supabase: Authentication → Sign In / Providers → Anonymous');
  sai++;
} else {
  const toi = phien.user.id;
  await db.from('ho_so').insert({ nguoi_dung: toi, ho_ten: 'Thử khoá dòng' });

  const { data: cuaToi } = await db.from('ho_so').select('*');
  ket(cuaToi?.length === 1 && cuaToi[0].nguoi_dung === toi,
      'đăng nhập rồi chỉ thấy đúng dòng của mình',
      `thấy ${cuaToi?.length ?? 0} dòng`);

  const { error: loiGiaMao } = await db
    .from('ho_so')
    .insert({ nguoi_dung: '00000000-0000-0000-0000-000000000001', ho_ten: 'Giả mạo' });
  ket(Boolean(loiGiaMao), 'KHÔNG ghi được hồ sơ cho người khác',
      loiGiaMao ? '' : 'ghi được, là lỗ hổng');

  await db.from('ho_so').delete().eq('nguoi_dung', toi);
}

console.log(
  sai === 0
    ? '\n==> KHOÁ DÒNG DỮ LIỆU ĂN ĐÚNG'
    : `\n==> CÓ ${sai} CHỖ SAI, SỬA XONG MỚI ĐƯỢC PHÁT HÀNH`
);
process.exit(sai === 0 ? 0 : 1);
