/**
 * Thử sửa MỘT mục trong hồ sơ, xem các mục khác có bị xoá trắng không.
 *
 * Chạy:  node supabase/thu-sua-mot-muc.mjs
 *
 * Cố ý KHÔNG thêm lệnh npm cho script này. Danh sách scripts trong package.json
 * nằm trong dấu vân tay của expo-updates, thêm một dòng vào đó là đổi dấu vân
 * tay, và bản cập nhật từ xa không còn tới được các bản app đã cài.
 *
 * Lỗi thật: mấy mục trong phần Cá nhân dẫn thẳng vào giữa luồng nhập năm bước,
 * mà bước cuối thì ghi CẢ hồ sơ từ bản nhập tạm. Bản tạm đã bị dọn sau lần tạo
 * tài khoản đầu, nên bấm "Nơi sinh" rồi đi tiếp là ghi đè họ tên rỗng và ngày
 * sinh "-00-00" lên hồ sơ thật.
 *
 * Script chạy lại đúng trình tự đó bằng khoá công khai mà app dùng.
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

/** Chép y nguyên napTuHoSo trong src/lib/ban-nhap.ts. */
function napTuHoSo(h) {
  if (!h) return null;
  const [nam = '', thang = '', ngay = ''] = (h.ngay_sinh ?? '').split('-');
  const [gio = '', phut = ''] = (h.gio_sinh ?? '').split(':');
  return {
    hoTen: h.ho_ten ?? '',
    ngay: ngay ? String(Number(ngay)) : '',
    thang: thang ? String(Number(thang)) : '',
    nam,
    gio: gio ? String(Number(gio)) : '',
    phut,
    noiSinh: h.noi_sinh,
    gioiTinh: h.gioi_tinh,
  };
}

const TRONG = {
  hoTen: '', ngay: '', thang: '', nam: '', gio: '', phut: '', noiSinh: null, gioiTinh: null,
};

/** Chép y nguyên cách màn hoàn tất dựng dữ liệu rồi ghi. */
function tuBanNhap(b) {
  return {
    ho_ten: b.hoTen,
    ngay_sinh: `${b.nam}-${b.thang.padStart(2, '0')}-${b.ngay.padStart(2, '0')}`,
    gio_sinh: b.gio ? `${b.gio.padStart(2, '0')}:${(b.phut || '0').padStart(2, '0')}` : null,
    noi_sinh: b.noiSinh,
    gioi_tinh: b.gioiTinh,
  };
}

const { data: phien, error: loiDN } = await db.auth.signInAnonymously();
ket(!loiDN, 'tạo được tài khoản ẩn danh', loiDN?.message ?? '');
if (loiDN) process.exit(1);
const toi = phien.user.id;

const GOC_HS = {
  ho_ten: 'Nguyễn Thử Nghiệm',
  ngay_sinh: '1995-09-16',
  gio_sinh: '07:30',
  noi_sinh: 'Lâm Đồng',
  gioi_tinh: 'nam',
};

async function ghi(phan) {
  const { data, error } = await db
    .from('ho_so')
    .upsert({ ...phan, nguoi_dung: toi, sua_luc: new Date().toISOString() })
    .select()
    .single();
  if (error) return { loi: error.message };
  return { hoSo: data };
}

// 1. Nhập hồ sơ lần đầu
const dau = await ghi(GOC_HS);
ket(dau.hoSo?.ho_ten === GOC_HS.ho_ten, 'lưu được hồ sơ đầy đủ', dau.loi ?? '');

// 2. Bấm "Nơi sinh" trong Cá nhân, CHƯA nạp sẵn — đây là lỗi cũ
{
  const b = { ...TRONG, noiSinh: 'Hà Nội', gioiTinh: 'nam' };
  const phan = tuBanNhap(b);
  ket(phan.ngay_sinh === '-00-00', 'bản cũ dựng ra ngày sinh hỏng', phan.ngay_sinh);
  const r = await ghi(phan);
  ket(Boolean(r.loi) || r.hoSo?.ho_ten === '', 'bản cũ làm hỏng hồ sơ', r.loi ?? `họ tên thành "${r.hoSo?.ho_ten}"`);
}

// Dựng lại hồ sơ cho phép thử sau
await ghi(GOC_HS);

// 3. Bấm "Nơi sinh" SAU KHI nạp sẵn từ hồ sơ — bản đã vá
{
  const { data: dangCo } = await db.from('ho_so').select('*').eq('nguoi_dung', toi).single();
  const b = napTuHoSo(dangCo);
  b.noiSinh = 'Hà Nội'; // khách chỉ sửa đúng mục này
  const r = await ghi(tuBanNhap(b));
  ket(!r.loi, 'bản vá lưu được', r.loi ?? '');
  ket(r.hoSo?.ho_ten === GOC_HS.ho_ten, 'họ tên giữ nguyên', r.hoSo?.ho_ten);
  ket(r.hoSo?.ngay_sinh === GOC_HS.ngay_sinh, 'ngày sinh giữ nguyên', r.hoSo?.ngay_sinh);
  ket(r.hoSo?.gio_sinh?.slice(0, 5) === GOC_HS.gio_sinh, 'giờ sinh giữ nguyên', r.hoSo?.gio_sinh);
  ket(r.hoSo?.gioi_tinh === GOC_HS.gioi_tinh, 'giới tính giữ nguyên', r.hoSo?.gioi_tinh);
  ket(r.hoSo?.noi_sinh === 'Hà Nội', 'nơi sinh đã đổi', r.hoSo?.noi_sinh);
}

// 4. Hồ sơ không có giờ sinh thì nạp đi nạp lại vẫn phải là rỗng, không thành 00:00
{
  await ghi({ ...GOC_HS, gio_sinh: null });
  const { data: dangCo } = await db.from('ho_so').select('*').eq('nguoi_dung', toi).single();
  const b = napTuHoSo(dangCo);
  const phan = tuBanNhap(b);
  ket(phan.gio_sinh === null, 'không nhớ giờ sinh thì vẫn là rỗng', String(phan.gio_sinh));
}

await db.from('ho_so').delete().eq('nguoi_dung', toi);
await db.auth.signOut();

console.log('');
console.log(sai === 0 ? '==> TAT CA DEU DUNG' : `==> CO ${sai} CHO SAI`);
process.exitCode = sai === 0 ? 0 : 1;
