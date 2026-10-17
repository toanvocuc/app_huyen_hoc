/** Giữ tạm lần rút vừa xong để màn kết quả đọc. Không lưu lâu dài. */
import { MAU_LA_BAI } from '@/data/noi-dung-mau';
import { khiDoiTaiKhoan } from '@/lib/doi-tai-khoan';
import { VI_TRI, type LaDaRut } from '@/lib/tarot';
import { XEM_THU } from '@/lib/xem-thu';

let phien: { cacLa: LaDaRut[]; daGhi: boolean } | null = null;

// Máy đổi sang người khác thì lần rút của người cũ không còn là của ai cả.
khiDoiTaiKhoan(() => {
  phien = null;
});

export function datPhien(cacLa: LaDaRut[]) {
  phien = { cacLa, daGhi: false };
}

/**
 * Đánh dấu lần rút này đã ghi xuống máy chủ.
 *
 * Màn kết quả ghi vào bảng lan_rut lúc dựng. Quay lại màn đó, ví dụ từ màn chia
 * sẻ, là nó dựng lại và ghi thêm một dòng nữa. Mà số dòng trong ngày chính là số
 * lượt rút còn lại, nên khách mất một lượt mình không hề dùng.
 */
export function danhDauDaGhi(da = true) {
  if (phien) phien.daGhi = da;
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
      // Chế độ xem thử không ghi gì xuống máy chủ, nên coi như đã ghi rồi.
      daGhi: true,
    };
  }
  return phien;
}
