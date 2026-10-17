/**
 * Phần tính toán thuần của gian hàng: tiền, bậc giá, và đoạn chữ gửi cửa hàng.
 *
 * File này KHÔNG import gì cả, và đó là điều kiện để `npm run kiem-tra` chạy
 * được dưới Node — Node không giải được bí danh `@/lib`. Hai phần gộp chung một
 * file vì phần dựng tin nhắn cần tới phép tính bậc giá; tách ra là phải import,
 * mà import là mất luôn chỗ chạy phép thử.
 *
 * Đây cũng là phần dễ sai nhất của gian hàng, và là phần khách soi kỹ nhất —
 * sai một con số là mất lòng tin, không có đường chữa.
 */

/** Một bậc giá theo số lượng: mua từ `tu` món trở lên thì tính `gia`. */
export type BacGia = { tu: number; gia: number };

/** 280000 → '280.000đ' */
export function tien(d: number): string {
  return `${Math.round(d).toLocaleString('vi-VN')}đ`;
}

/**
 * Giá một món khi lấy `soLuong` cái.
 *
 * Bậc nào có ngưỡng `tu` cao nhất mà vẫn ≤ số lượng thì thắng. Xếp lại theo
 * ngưỡng ngay trong hàm chứ không tin dữ liệu đã xếp sẵn: bảng giá do người
 * nhập tay, và một bậc đặt nhầm thứ tự thì khách bị tính giá cao hơn mức đáng
 * được hưởng — kiểu sai không ai báo lỗi, chỉ lặng lẽ thiệt cho khách.
 */
export function giaTheoSoLuong(giaGoc: number, bac: BacGia[] | null | undefined, soLuong: number): number {
  if (!bac || bac.length === 0) return giaGoc;
  const hop = bac
    .filter((b) => Number.isFinite(b.tu) && Number.isFinite(b.gia) && soLuong >= b.tu)
    .sort((a, b) => b.tu - a.tu);
  return hop.length > 0 ? hop[0].gia : giaGoc;
}

/**
 * Dòng chữ mô tả bậc giá, ví dụ 'Từ 10 vòng: 249.000đ'.
 *
 * Trả mảng rỗng khi món không có bậc nào — chỗ gọi khỏi phải tự xét null.
 */
export function dongBacGia(bac: BacGia[] | null | undefined, donVi: string): string[] {
  if (!bac || bac.length === 0) return [];
  return [...bac]
    .filter((b) => Number.isFinite(b.tu) && Number.isFinite(b.gia))
    .sort((a, b) => a.tu - b.tu)
    .map((b) => `Từ ${b.tu} ${donVi}: ${tien(b.gia)}`);
}

/** '280.000đ / vòng' */
export function giaKemDonVi(gia: number, donVi: string): string {
  return `${tien(gia)} / ${donVi}`;
}

// ---------------------------------------------------------------------- tin nhắn gửi cửa hàng

export type DongQuanTam = {
  ten: string;
  soLuong: number;
  gia: number;
  donVi: string;
  bacGia?: BacGia[] | null;
};

/** '18/10 09:30' — ngắn, đủ để cửa hàng biết tin này gửi lúc nào. */
function gioNgan(d: Date): string {
  const hai = (n: number) => String(n).padStart(2, '0');
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)} ${hai(d.getHours())}:${hai(d.getMinutes())}`;
}

export function tongTien(ds: DongQuanTam[]): number {
  return ds.reduce((t, m) => t + giaTheoSoLuong(m.gia, m.bacGia, m.soLuong) * m.soLuong, 0);
}

/**
 * Đoạn chữ hoàn chỉnh để dán sang Zalo.
 *
 * Mỗi món hai dòng: tên ở dòng trên cho dễ đọc, số lượng và tiền ở dòng dưới.
 * Nhét hết vào một dòng thì tên hàng dài là Zalo tự ngắt chỗ khác, nhìn vỡ hết.
 */
export function dungTinNhan(ds: DongQuanTam[], bayGio: Date): string {
  if (ds.length === 0) return '';
  const dong: string[] = [`DANH SÁCH QUAN TÂM — OMORA`, gioNgan(bayGio), ''];

  ds.forEach((m, i) => {
    const don = giaTheoSoLuong(m.gia, m.bacGia, m.soLuong);
    dong.push(`${i + 1}. ${m.ten}`);
    dong.push(`   ${m.soLuong} ${m.donVi} x ${tien(don)} = ${tien(don * m.soLuong)}`);
  });

  dong.push('');
  dong.push(`Tạm tính: ${tien(tongTien(ds))}`);
  dong.push('');
  dong.push('Mình muốn hỏi thêm về mấy món này.');
  return dong.join('\n');
}
