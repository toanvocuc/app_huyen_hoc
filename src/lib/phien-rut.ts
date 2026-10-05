/** Giữ tạm lần rút vừa xong để màn kết quả đọc. Không lưu lâu dài. */
import { MAU_LA_BAI } from '@/data/noi-dung-mau';
import { VI_TRI, type LaDaRut } from '@/lib/tarot';
import { XEM_THU } from '@/lib/xem-thu';

let phien: { cacLa: LaDaRut[]; cauHoi: string } | null = null;

export function datPhien(cacLa: LaDaRut[], cauHoi = '') {
  phien = { cacLa, cauHoi };
}

/**
 * Chế độ xem thử dựng sẵn một lần rút ba lá, để vào thẳng màn kết quả vẫn xem
 * được mà không phải bấm qua màn rút. Bản chạy thật trả null như cũ, nên khách
 * vào thẳng đường dẫn đó vẫn thấy câu nhắc quay lại rút bài.
 */
export function layPhien() {
  if (!phien && XEM_THU) {
    const viTri = VI_TRI['ba-la'];
    phien = {
      cacLa: viTri.map((v, i) => ({
        la: MAU_LA_BAI[i * 7 + 3],
        nguoc: i === 1,
        viTri: v,
      })),
      cauHoi: 'Công việc sắp tới của mình thế nào?',
    };
  }
  return phien;
}
