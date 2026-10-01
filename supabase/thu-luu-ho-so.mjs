/**
 * Thử trọn đường lưu hồ sơ, đúng như app làm khi khách nhập xong năm bước.
 *
 * Chạy:  node supabase/thu-luu-ho-so.mjs
 *
 * Viết ra sau khi sót cột noi_sinh: kiểm từng cột riêng lẻ chưa đủ, phải chạy thật
 * một lượt từ đăng nhập tới ghi rồi đọc lại thì mới biết đường đi có thông không.
 * Dọn sạch sau khi thử, không để lại hồ sơ rác.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

const mt = Object.fromEntries(
  readFileSync(join(GOC, '.env'), 'utf8')
    .split('\n')
    .map((d) => d.trim())
    .filter((d) => d && !d.startsWith('#'))
    .map((d) => [d.slice(0, d.indexOf('=')).trim(), d.slice(d.indexOf('=') + 1).trim()])
);

const db = createClient(mt.EXPO_PUBLIC_SUPABASE_URL, mt.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

let sai = 0;
function ket(dat, ten, them = '') {
  if (!dat) sai++;
  console.log(`${dat ? 'OK  ' : 'SAI '} ${ten}${them ? ' — ' + them : ''}`);
}

// 1. Mở app lần đầu: tự tạo tài khoản ẩn danh
const { data: phien, error: loiDangNhap } = await db.auth.signInAnonymously();
ket(!loiDangNhap, 'tạo được tài khoản ẩn danh', loiDangNhap?.message ?? '');
if (loiDangNhap) process.exit(1);
const toi = phien.user.id;

// 2. Nhập xong năm bước rồi lưu, đúng những cột app gửi
const hoSo = {
  nguoi_dung: toi,
  ho_ten: 'Nguyễn Thị Ánh Đào',
  ngay_sinh: '1995-09-16',
  gio_sinh: '07:30',
  noi_sinh: 'Hà Nội',
  gioi_tinh: 'nu',
  sua_luc: new Date().toISOString(),
};
const { data: daLuu, error: loiLuu } = await db.from('ho_so').upsert(hoSo).select().single();
ket(!loiLuu, 'lưu được hồ sơ đủ sáu trường', loiLuu?.message ?? '');

if (!loiLuu) {
  ket(daLuu.ho_ten === hoSo.ho_ten, 'họ tên đọc lại còn nguyên dấu', daLuu.ho_ten);
  ket(daLuu.noi_sinh === 'Hà Nội', 'nơi sinh lưu đúng', daLuu.noi_sinh);
  ket(daLuu.ngay_sinh === '1995-09-16', 'ngày sinh lưu đúng', daLuu.ngay_sinh);
  ket(String(daLuu.gio_sinh).startsWith('07:30'), 'giờ sinh lưu đúng', daLuu.gio_sinh);
  ket(String(daLuu.gio_nhac).startsWith('07:00'), 'giờ nhắc mặc định 07:00', daLuu.gio_nhac);
}

// 3. Sửa hồ sơ, như khi khách đổi giờ nhận thông báo
const { error: loiSua } = await db.from('ho_so').upsert({ nguoi_dung: toi, gio_nhac: '08:00' });
ket(!loiSua, 'sửa được hồ sơ đã có', loiSua?.message ?? '');

// 4. Rút bài rồi lưu lịch sử
const { error: loiRut } = await db.from('lan_rut').insert({
  nguoi_dung: toi,
  kieu_trai: 'ba-la',
  cac_la: [{ ma: 'major-00', nguoc: false, vi_tri: 'Quá khứ' }],
  cau_hoi: 'Thử, xoá sau',
});
ket(!loiRut, 'lưu được lần rút bài', loiRut?.message ?? '');

// 5. Ghi mốc đếm phễu khi khách bấm sang Zalo
const { error: loiSuKien } = await db.from('su_kien').insert({
  nguoi_dung: toi,
  loai: 'bam_zalo',
  man_hinh: 'hom-nay',
  ma_theo_doi: 'TH' + Math.random().toString(36).slice(2, 4).toUpperCase(),
});
ket(!loiSuKien, 'ghi được sự kiện bấm Zalo', loiSuKien?.message ?? '');

// 6. Xoá toàn bộ dữ liệu, làm y hệt xoaSachDuLieu trong app.
// Phải xoá đích danh cả ba bảng: lan_rut và su_kien treo vào tài khoản chứ không
// treo vào ho_so, nên xoá mỗi dòng hồ sơ là chúng nằm lại.
for (const bang of ['su_kien', 'lan_rut', 'ho_so']) {
  const { error } = await db.from(bang).delete().eq('nguoi_dung', toi);
  ket(!error, `xoá được ${bang} của mình`, error?.message ?? '');
}

for (const bang of ['su_kien', 'lan_rut', 'ho_so']) {
  const { count } = await db
    .from(bang)
    .select('*', { count: 'exact', head: true })
    .eq('nguoi_dung', toi);
  ket(count === 0, `${bang} không còn dòng nào`, `còn ${count}`);
}

console.log(
  sai === 0 ? '\n==> ĐƯỜNG LƯU HỒ SƠ THÔNG SUỐT' : `\n==> CÓ ${sai} CHỖ SAI`
);
process.exit(sai === 0 ? 0 : 1);
