/**
 * Kiểm bộ đọc CSV trên đúng sáu file nội dung thật.
 * Chạy: node kiem-tra/doc-csv.mjs
 */

import { join } from 'node:path';

import { docCsv } from '../supabase/doc-csv.mjs';

const MONG = [
  ['tarot_78_la.csv', 78, ['ma', 'bo', 'so', 'ten_vi', 'ten_en', 'tu_khoa',
                           'y_nghia_xuoi', 'y_nghia_nguoc', 'tinh_cam', 'cong_viec', 'loi_khuyen']],
  ['so_chu_dao.csv', 12, ['so', 'ten', 'tinh_cach', 'diem_manh', 'diem_yeu', 'loi_khuyen']],
  ['so_van_menh.csv', 12, ['so', 'ten', 'y_nghia', 'loi_khuyen']],
  ['cung_hoang_dao.csv', 12, ['ma', 'ten', 'ten_en', 'tu_ngay', 'den_ngay', 'nguyen_to',
                              'tinh_chat', 'tinh_cach', 'diem_manh', 'diem_yeu']],
  ['do_hop_cung.csv', 78, ['cung_a', 'cung_b', 'ten_a', 'ten_b', 'diem', 'loi_binh']],
  ['quy_doi_chu_cai.csv', 26, ['chu_cai', 'gia_tri']],
];

let sai = 0;
function ket(dat, ten, them = '') {
  if (!dat) sai++;
  console.log(`${dat ? 'OK  ' : 'SAI '} ${ten}${them ? ' — ' + them : ''}`);
}

for (const [file, soDong, cot] of MONG) {
  const dong = docCsv(join('data', file));
  ket(dong.length === soDong, `${file} có ${soDong} dòng`, `đọc được ${dong.length}`);

  const thieuCot = cot.filter((c) => !(c in dong[0]));
  ket(thieuCot.length === 0, `${file} đủ ${cot.length} cột`, thieuCot.join(', '));

  const trong = dong.filter((d) => cot.some((c) => String(d[c] ?? '').trim() === ''));
  ket(trong.length === 0, `${file} không có ô trống`, `${trong.length} dòng thiếu`);
}

// Ô có dấu phẩy và dấu nháy bên trong phải được đọc nguyên vẹn.
const tarot = docCsv(join('data', 'tarot_78_la.csv'));
const coPhay = tarot.filter((d) => d.y_nghia_xuoi.includes(','));
ket(coPhay.length > 50, 'đọc đúng ô có dấu phẩy bên trong', `${coPhay.length} lá`);

const dai = tarot.filter((d) => d.y_nghia_xuoi.length > 80);
ket(dai.length > 70, 'nội dung không bị cắt cụt', `${dai.length} lá dài hơn 80 ký tự`);

// Mã lá phải trùng với tên file ảnh.
const maSai = tarot.filter((d) => !/^(major-\d{2}|(cups|wands|swords|pents)-\d{2})$/.test(d.ma));
ket(maSai.length === 0, 'mã lá đúng quy ước đặt tên ảnh', maSai.map((d) => d.ma).join(', '));

console.log(sai === 0 ? '\n==> TAT CA DEU DUNG' : `\n==> CO ${sai} CHO SAI`);
process.exit(sai === 0 ? 0 : 1);
