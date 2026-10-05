/**
 * Gửi một tin tới toàn bộ khách đã bật mục "Tin từ ứng dụng".
 *
 * Chạy:
 *   npm run gui-thong-bao "Tiêu đề" "Nội dung"
 *   npm run gui-thong-bao "Tiêu đề" "Nội dung" --that
 *
 * Không có --that thì chỉ in ra xem sẽ gửi cho bao nhiêu máy, KHÔNG gửi gì cả.
 * Gửi nhầm một tin cho toàn bộ khách thì không rút lại được, nên mặc định là thử.
 *
 * Đây là phần máy chủ của chức năng H04. Trang quản trị làm sau sẽ gọi đúng logic
 * này, nên chỗ nào cần sửa thì sửa ở đây.
 *
 * Cần khoá quản trị vì phải đọc mã thiết bị của mọi người, mà khoá dòng chỉ cho
 * mỗi khách đọc dòng của chính họ. Khoá đó nằm trong .env.quan-tri.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Expo nhận nhiều nhất 100 tin mỗi lần gọi. */
const MOI_LAN = 100;

function docMoiTruong(ten) {
  let noiDung;
  try {
    noiDung = readFileSync(join(GOC, ten), 'utf8');
  } catch {
    console.error(`Thiếu file ${ten}. Xem supabase/HUONG-DAN.md.`);
    return null;
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

/**
 * Cả phần thân nằm trong một hàm và chỗ nào xong thì `return`.
 *
 * Trước đây dùng process.exit() giữa chừng, và trên Windows Node ném ra
 * "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)" vì nó cắt ngang lúc
 * kết nối tới máy chủ còn đang dọn dẹp. Đặt mã thoát rồi để Node tự kết thúc.
 */
async function chay() {
  const [, , tieuDe, than, ...coMoi] = process.argv;
  const guiThat = coMoi.includes('--that');

  if (!tieuDe || !than) {
    console.error('Dùng: npm run gui-thong-bao "Tiêu đề" "Nội dung" [--that]');
    return 1;
  }

  const mt = docMoiTruong('.env.quan-tri');
  if (!mt) return 1;
  if (!mt.SUPABASE_URL || !mt.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.quan-tri');
    return 1;
  }

  const db = createClient(mt.SUPABASE_URL, mt.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Chỉ gửi cho người đã tự bật mục này. Gửi cho người đã tắt là lý do bị gỡ khỏi chợ.
  const { data: hoSo, error: loiHoSo } = await db
    .from('ho_so')
    .select('nguoi_dung')
    .eq('nhac_tin_tuc', true);
  if (loiHoSo) {
    console.error('Không đọc được hồ sơ:', loiHoSo.message);
    return 1;
  }

  const dongY = hoSo.map((h) => h.nguoi_dung);
  if (dongY.length === 0) {
    console.log('Chưa ai bật mục "Tin từ ứng dụng". Không gửi cho ai cả.');
    return 0;
  }

  const { data: thietBi, error: loiThietBi } = await db
    .from('thiet_bi')
    .select('ma_day, nen_tang, nguoi_dung')
    .in('nguoi_dung', dongY);
  if (loiThietBi) {
    console.error('Không đọc được thiết bị:', loiThietBi.message);
    return 1;
  }

  const ma = [...new Set(thietBi.map((t) => t.ma_day))];

  console.log(`Đã bật nhận tin : ${dongY.length} người`);
  console.log(`Máy nhận được   : ${ma.length}`);
  console.log(`Tiêu đề         : ${tieuDe}`);
  console.log(`Nội dung        : ${than}`);

  if (!guiThat) {
    console.log('\n==> Đây chỉ là bản thử, chưa gửi gì. Thêm --that để gửi thật.');
    return 0;
  }
  if (ma.length === 0) {
    console.log('\n==> Không có máy nào để gửi.');
    return 0;
  }

  let xong = 0;
  let hong = 0;

  for (let i = 0; i < ma.length; i += MOI_LAN) {
    const lo = ma.slice(i, i + MOI_LAN).map((to) => ({
      to,
      title: tieuDe,
      body: than,
      sound: 'default',
      channelId: 'la-bai-hom-nay',
    }));

    const tra = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(lo),
    });

    if (!tra.ok) {
      console.error(`Lô ${i / MOI_LAN + 1} hỏng: HTTP ${tra.status}`);
      hong += lo.length;
      continue;
    }

    const ketQua = await tra.json();
    for (const [j, r] of (ketQua.data ?? []).entries()) {
      if (r.status === 'ok') {
        xong++;
        continue;
      }
      hong++;
      console.warn(`  ${lo[j].to}: ${r.message ?? r.status}`);
      // Máy đã gỡ app thì Expo báo DeviceNotRegistered. Giữ lại chỉ tổ gửi hụt mãi.
      if (r.details?.error === 'DeviceNotRegistered') {
        await db.from('thiet_bi').delete().eq('ma_day', lo[j].to);
        console.warn('    đã xoá mã này khỏi bảng thiet_bi');
      }
    }
  }

  console.log(`\n==> Gửi được ${xong}, hỏng ${hong}`);
  return hong === 0 ? 0 : 1;
}

process.exitCode = await chay();
