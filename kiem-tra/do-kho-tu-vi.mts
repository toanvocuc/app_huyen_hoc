/**
 * Đo kho nội dung tử vi: chạy `npm run do-kho-tu-vi`.
 *
 * Hai thứ cần nhìn:
 *   - Cùng một ngày, 12 cung có đọc ra 12 bài khác nhau không. Hai người bạn
 *     khác cung ngồi so điện thoại mà thấy chữ y hệt là mất tin ngay.
 *   - Người xem mỗi sáng thì bao nhiêu ngày sau gặp lại bài cũ.
 *
 * Chạy lại sau mỗi lần thêm nội dung để biết đã đủ chưa.
 */
import { join } from 'node:path';

import { docCsv } from '../supabase/doc-csv.mjs';
import { layBaiTuVi, THU_TU_CUNG_DE_KIEM, type DongTuVi } from '../src/lib/tu-vi.ts';

const kho: DongTuVi[] = docCsv(join('data', 'tu_vi_mau.csv')).map((x: Record<string, string>) => ({
  ky: x.ky as DongTuVi['ky'],
  muc: x.muc as DongTuVi['muc'],
  cung: x.cung,
  thu_tu: Number(x.thu_tu),
  noi_dung: x.noi_dung,
}));

const CUNG = THU_TU_CUNG_DE_KIEM;
const moc = new Date(2026, 9, 15);

console.log('=== cung mot ngay, 12 cung doc ra may bai khac nhau ===');
for (const ky of ['ngay', 'tuan'] as const) {
  const theo = new Map<string, string[]>();
  for (const c of CUNG) {
    const b = layBaiTuVi(kho, c, ky, moc) as Record<string, unknown>;
    for (const [ten, v] of Object.entries(b)) {
      if (typeof v !== 'string') continue;
      if (!theo.has(ten)) theo.set(ten, []);
      theo.get(ten)!.push(v);
    }
  }
  for (const [ten, ds] of theo) {
    const rieng = new Set(ds).size;
    const canh = rieng < 12 ? `  <-- ${12 - rieng} cung trung bai` : '';
    console.log(`  ${ky}/${ten}: ${rieng}/12 bai khac nhau${canh}`);
  }
}

console.log('');
console.log('=== xem moi ngay thi bao nhieu ngay sau gap lai bai cu ===');
for (const muc of ['tongQuan', 'tinhCam', 'congViec', 'sucKhoe'] as const) {
  let somNhat = Infinity;
  let cungTe = '';
  for (const c of CUNG) {
    const thay = new Map<string, number>();
    for (let n = 0; n < 500; n++) {
      const d = new Date(2026, 9, 15 + n);
      const t = (layBaiTuVi(kho, c, 'ngay', d) as Record<string, unknown>)[muc];
      if (typeof t !== 'string') continue;
      const truoc = thay.get(t);
      if (truoc !== undefined && n - truoc < somNhat) {
        somNhat = n - truoc;
        cungTe = c;
      }
      thay.set(t, n);
    }
  }
  if (somNhat === Infinity) console.log(`  ${muc}: khong co du lieu`);
  else console.log(`  ${muc}: som nhat ${somNhat} ngay (cung ${cungTe})`);
}
