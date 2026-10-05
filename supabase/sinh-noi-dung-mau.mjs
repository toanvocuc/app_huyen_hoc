/**
 * Sinh src/data/noi-dung-mau.ts từ bộ CSV trong data/.
 *
 * Chạy:  node supabase/sinh-noi-dung-mau.mjs
 *
 * File sinh ra chỉ dùng cho CHẾ ĐỘ XEM THỬ, lúc chụp màn hình hoặc xem nhanh
 * trên trình duyệt mà không muốn gọi cơ sở dữ liệu. Bản chạy thật vẫn đọc từ
 * Supabase. Thêm bảng nội dung mới thì thêm một dòng vào BANG bên dưới, không
 * thì chế độ xem thử hiện màn trắng ở chỗ đó.
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { docCsv } from './doc-csv.mjs';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Cột nào là số thì đổi kiểu, để so sánh bằng === trong app không hụt. */
const SO = new Set(['so', 'diem', 'thu_tu']);

/** Cột nào bỏ đi, giống hệt danh sách bên nap-du-lieu.mjs. */
const BO_COT = { 'do_hop_cung.csv': ['ten_a', 'ten_b'] };

/**
 * Riêng bảng lá bài đổi tên cột sang kiểu camelCase, vì app dùng kiểu LaBai
 * chứ không dùng thẳng tên cột của cơ sở dữ liệu.
 */
const DOI_TEN_LA_BAI = {
  ten_vi: 'tenVi',
  ten_en: 'tenEn',
  tu_khoa: 'tuKhoa',
  y_nghia_xuoi: 'yNghiaXuoi',
  y_nghia_nguoc: 'yNghiaNguoc',
  tinh_cam: 'tinhCam',
  cong_viec: 'congViec',
  loi_khuyen: 'loiKhuyen',
};

const BANG = [
  ['MAU_LA_BAI', 'tarot_78_la.csv', ': LaBai[]'],
  ['MAU_CUNG', 'cung_hoang_dao.csv', ''],
  ['MAU_DO_HOP', 'do_hop_cung.csv', ''],
  ['MAU_SO_CHU_DAO', 'so_chu_dao.csv', ''],
  ['MAU_SO_VAN_MENH', 'so_van_menh.csv', ''],
  ['MAU_MUI_TEN_BIEU_DO', 'mui_ten_bieu_do.csv', ''],
  ['MAU_CON_SO_BIEU_DO', 'con_so_bieu_do.csv', ''],
  ['MAU_TU_VI', 'tu_vi_mau.csv', ''],
];

const phan = [
  `/**
 * Nội dung đóng sẵn trong app, chỉ dùng cho CHẾ ĐỘ XEM THỬ.
 *
 * Bản chạy thật đọc từ cơ sở dữ liệu để sửa chữ nghĩa mà không phải phát hành lại app.
 * File này sinh ra từ data/*.csv, đừng sửa tay.
 */

import type { LaBai } from '@/lib/tarot';
`,
];

for (const [ten, file, kieu] of BANG) {
  const bo = BO_COT[file] ?? [];
  const dong = docCsv(join(GOC, 'data', file)).map((d) => {
    const ra = {};
    for (const [k, v] of Object.entries(d)) {
      if (bo.includes(k)) continue;
      const khoa = ten === 'MAU_LA_BAI' ? (DOI_TEN_LA_BAI[k] ?? k) : k;
      ra[khoa] = SO.has(k) ? Number(v) : v;
    }
    return ra;
  });
  phan.push(`export const ${ten}${kieu} = ${JSON.stringify(dong)};`);
}

const dich = join(GOC, 'src', 'data', 'noi-dung-mau.ts');
writeFileSync(dich, phan.join('\n') + '\n', 'utf8');

for (const [ten, file] of BANG) {
  console.log(`${ten.padEnd(22)} <- ${file}`);
}
console.log(`\n==> ${dich}`);
