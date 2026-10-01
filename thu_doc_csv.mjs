
import { readFileSync } from 'node:fs';
const s0 = readFileSync('data/tarot_78_la.csv', 'utf8');
const s = s0.charCodeAt(0) === 0xfeff ? s0.slice(1) : s0;
const hang = []; let o = []; let dem = ''; let ng = false;
for (let i = 0; i < s.length; i++) {
  const c = s[i];
  if (ng) { if (c === '"') { if (s[i+1] === '"') { dem += '"'; i++; } else ng = false; } else dem += c; }
  else if (c === '"') ng = true;
  else if (c === ',') { o.push(dem); dem = ''; }
  else if (c === '
') { o.push(dem); hang.push(o); o = []; dem = ''; }
  else if (c !== '') dem += c;
}
if (dem || o.length) { o.push(dem); hang.push(o); }
const cot = hang.shift();
const dong = hang.filter(h => h.some(v => v !== '')).map(h => Object.fromEntries(cot.map((k,i)=>[k,h[i] ?? ''])));
console.log('so cot:', cot.length, '|', cot.join(','));
console.log('so dong:', dong.length);
const d = dong[0];
console.log('dong dau:', d.ma, '|', d.ten_vi, '|', d.tu_khoa);
console.log('o co dau phay:', JSON.stringify(d.y_nghia_xuoi).slice(0, 90));
const thieu = dong.filter(x => !x.ma || !x.ten_vi || !x.y_nghia_nguoc);
console.log('dong thieu truong:', thieu.length);
