/**
 * Đọc file CSV thành mảng object.
 *
 * Tự viết thay vì cài thêm gói, vì nội dung tiếng Việt có dấu phẩy và xuống dòng
 * nằm bên trong ô nên không tách bằng split được.
 */

import { readFileSync } from 'node:fs';

export function docCsv(duongDan) {
  let s = readFileSync(duongDan, 'utf8');
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1); // bỏ dấu BOM

  const hang = [];
  let o = [];
  let dem = '';
  let trongNgoac = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (trongNgoac) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          dem += '"'; // hai dấu nháy liền nhau là một dấu nháy thật
          i++;
        } else trongNgoac = false;
      } else dem += c;
    } else if (c === '"') {
      trongNgoac = true;
    } else if (c === ',') {
      o.push(dem);
      dem = '';
    } else if (c === '\n') {
      o.push(dem);
      hang.push(o);
      o = [];
      dem = '';
    } else if (c !== '\r') {
      dem += c;
    }
  }
  if (dem || o.length) {
    o.push(dem);
    hang.push(o);
  }

  const cot = hang.shift();
  return hang
    .filter((h) => h.some((v) => v !== ''))
    .map((h) => Object.fromEntries(cot.map((k, i) => [k, h[i] ?? ''])));
}
