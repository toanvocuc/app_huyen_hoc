/**
 * Thử đúng đường đi đã làm khách mất sạch dữ liệu: xoá toàn bộ, rồi nhập lại.
 *
 * Chạy:  node supabase/thu-xoa-roi-nhap-lai.mjs
 *
 * Lỗi thật: hàm xoá kết thúc bằng signOut, mà màn gốc chỉ tạo phiên ẩn danh một
 * lần lúc mở app. Khách xoá xong, nhập lại đủ năm bước, tới bước cuối mới báo
 * "Chưa có phiên đăng nhập" và mất hết thứ vừa gõ.
 *
 * Script này chạy lại y hệt trình tự đó bằng khoá công khai mà app dùng. Dọn
 * sạch sau khi thử, không để lại hồ sơ rác.
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

/** Đúng những gì dangNhapAnDanh làm: có phiên thì dùng lại, không thì tạo mới. */
async function dangNhapAnDanh() {
  const { data } = await db.auth.getSession();
  if (data.session) return data.session.user;
  const { data: moi, error } = await db.auth.signInAnonymously();
  if (error) throw error;
  return moi.user;
}

/** Đúng những gì luuHoSo làm sau khi vá. */
async function luuHoSo(phan) {
  await dangNhapAnDanh();
  const { data: u } = await db.auth.getUser();
  if (!u.user) throw new Error('Chưa có phiên đăng nhập');
  const { data, error } = await db
    .from('ho_so')
    .upsert({ ...phan, nguoi_dung: u.user.id, sua_luc: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Đúng những gì xoaSachDuLieu làm sau khi vá. */
async function xoaSachDuLieu() {
  const { data: u } = await db.auth.getUser();
  if (!u.user) return;
  const toi = u.user.id;
  for (const bang of ['su_kien', 'lan_rut', 'thiet_bi', 'ho_so']) {
    const { error } = await db.from(bang).delete().eq('nguoi_dung', toi);
    if (error) throw error;
  }
  await db.auth.signOut();
  await dangNhapAnDanh();
}

const MAU = {
  ho_ten: 'Thử Xoá Nhập Lại',
  ngay_sinh: '1995-09-16',
  gio_sinh: '07:30',
  noi_sinh: 'Lâm Đồng',
  gioi_tinh: 'nam',
};

// 1. Mở app lần đầu, nhập hồ sơ
const nguoi1 = await dangNhapAnDanh();
ket(Boolean(nguoi1), 'mở app lần đầu, có tài khoản ẩn danh');
const ho_so_1 = await luuHoSo(MAU);
ket(ho_so_1?.ho_ten === MAU.ho_ten, 'lưu được hồ sơ lần đầu');
const ma1 = nguoi1.id;

// 2. Vào Cá nhân, xoá toàn bộ dữ liệu
await xoaSachDuLieu();
const { data: sauXoa } = await db.auth.getSession();
ket(Boolean(sauXoa.session), 'xoá xong vẫn còn phiên để dùng tiếp');
const ma2 = sauXoa.session?.user?.id;
ket(ma2 && ma2 !== ma1, 'phiên sau khi xoá là tài khoản mới, không phải tài khoản cũ');

// 3. Nhập lại năm bước rồi lưu — đây là chỗ trước đây hỏng
let loiLuu = null;
let ho_so_2 = null;
try {
  ho_so_2 = await luuHoSo({ ...MAU, ho_ten: 'Lần Hai' });
} catch (e) {
  loiLuu = e;
}
ket(!loiLuu, 'xoá xong nhập lại vẫn lưu được hồ sơ', loiLuu?.message ?? '');
ket(ho_so_2?.ho_ten === 'Lần Hai', 'hồ sơ mới ghi đúng nội dung');

// 4. Hồ sơ cũ phải đã biến mất
const { data: conLai } = await db.from('ho_so').select('*').eq('nguoi_dung', ma1);
ket((conLai ?? []).length === 0, 'hồ sơ của tài khoản cũ đã xoá hẳn');

// Dọn
await db.from('ho_so').delete().eq('nguoi_dung', ma2);
await db.auth.signOut();

console.log('');
console.log(sai === 0 ? '==> TAT CA DEU DUNG' : `==> CO ${sai} CHO SAI`);
process.exitCode = sai === 0 ? 0 : 1;
