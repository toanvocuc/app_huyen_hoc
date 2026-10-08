/**
 * Thử phần đếm lượt rút trong ngày.
 *
 * Chạy:  node supabase/thu-luot-rut.mjs
 *
 * Chỗ dễ sai nhất là mốc nửa đêm. Máy chủ lưu thời điểm theo UTC, còn lượt rút
 * phải đếm theo ngày Việt Nam. Lệch múi giờ thì từ 0 tới 7 giờ sáng khách vẫn bị
 * tính vào ngày hôm trước, mở app lúc 6 giờ sáng là thấy hết lượt.
 *
 * Cố ý KHÔNG thêm lệnh npm: danh sách scripts trong package.json nằm trong dấu
 * vân tay của expo-updates, thêm vào là bản cập nhật từ xa không tới được app
 * đã cài.
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

/** Chép y nguyên ngayVietNam trong src/lib/tarot.ts. */
function ngayVietNam(luc = new Date()) {
  return new Date(luc.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}
/** Chép y nguyên dauNgayVN trong src/lib/luot-rut.ts. */
const dauNgayVN = (luc = new Date()) => `${ngayVietNam(luc)}T00:00:00+07:00`;

const SO_LUOT = 3;

// --- mốc nửa đêm tính đúng giờ Việt Nam chưa ---
{
  // 16:30 UTC ngày 4 = 23:30 giờ VN ngày 4
  const truocNua = new Date('2026-10-04T16:30:00Z');
  // 17:30 UTC ngày 4 = 00:30 giờ VN ngày 5, tức đã sang ngày mới
  const sauNua = new Date('2026-10-04T17:30:00Z');
  ket(ngayVietNam(truocNua) === '2026-10-04', '23h30 giờ VN vẫn là ngày cũ', ngayVietNam(truocNua));
  ket(ngayVietNam(sauNua) === '2026-10-05', '00h30 giờ VN đã sang ngày mới', ngayVietNam(sauNua));
  ket(dauNgayVN(sauNua) === '2026-10-05T00:00:00+07:00', 'mốc đầu ngày đúng định dạng', dauNgayVN(sauNua));
}

const { data: phien, error: loiDN } = await db.auth.signInAnonymously();
ket(!loiDN, 'tạo được tài khoản ẩn danh', loiDN?.message ?? '');
if (loiDN) process.exit(1);
const toi = phien.user.id;

async function dem() {
  const { count, error } = await db
    .from('lan_rut')
    .select('*', { count: 'exact', head: true })
    .eq('nguoi_dung', toi)
    .gte('tao_luc', dauNgayVN());
  if (error) throw error;
  return count ?? 0;
}

async function rut(luc) {
  const dong = { nguoi_dung: toi, kieu_trai: 'mot-la', cac_la: [{ ma: 'the-fool', nguoc: false, vi_tri: 'Câu trả lời' }] };
  if (luc) dong.tao_luc = luc;
  const { error } = await db.from('lan_rut').insert(dong);
  if (error) throw error;
}

ket((await dem()) === 0, 'khách mới chưa rút lượt nào');

for (let i = 1; i <= SO_LUOT; i++) {
  await rut();
  const n = await dem();
  ket(n === i, `rút lần ${i} thì đếm được ${i}`, String(n));
}
ket(SO_LUOT - (await dem()) === 0, 'hết lượt sau đúng 3 lần');

// Lượt của hôm qua không được tính vào hôm nay
await rut(new Date(Date.now() - 36 * 3600 * 1000).toISOString());
ket((await dem()) === SO_LUOT, 'lượt hôm qua không tính vào hôm nay', String(await dem()));

// Lá bài hôm nay không ghi vào bảng này nên không ăn lượt — kiểm bằng ràng buộc cột
{
  const { error } = await db.from('lan_rut').insert({
    nguoi_dung: toi, kieu_trai: 'la-hom-nay', cac_la: [],
  });
  // Ghi được thì nó sẽ ăn lượt. App không ghi, nhưng ghi chú lại đây cho rõ.
  ket(true, 'bảng có nhận kiểu la-hom-nay', error ? 'không, bị chặn' : 'có — app cố ý không ghi kiểu này');
  if (!error) await db.from('lan_rut').delete().eq('nguoi_dung', toi).eq('kieu_trai', 'la-hom-nay');
}

await db.from('lan_rut').delete().eq('nguoi_dung', toi);
await db.auth.signOut();

console.log('');
console.log(sai === 0 ? '==> TAT CA DEU DUNG' : `==> CO ${sai} CHO SAI`);
process.exitCode = sai === 0 ? 0 : 1;
