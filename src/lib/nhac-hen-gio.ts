/**
 * Phần tính giờ của lời nhắc hẹn. CỐ Ý KHÔNG NHẬP GÌ.
 *
 * Tách khỏi `nhac-hen.ts` vì file kia phải nhập expo-notifications, mà gói đó
 * không chạy được ngoài máy ảo — nên nếu để chung thì phần dễ sai nhất lại là
 * phần không thử được. Ở đây thuần tính toán, `npm run kiem-tra` gọi thẳng.
 *
 * Chỗ dễ sai: dựng ngày từ chuỗi 'yyyy-mm-dd'. Truyền thẳng chuỗi đó vào
 * `new Date(...)` là JavaScript hiểu theo UTC, nên ở Việt Nam ra lùi một ngày —
 * lời nhắc "mai có hẹn" sẽ kêu sớm trước một ngày.
 */

/** Giờ bắt đầu khung, suy từ chính chuỗi khách đã chọn. */
export function gioBatDau(khungGio: string): number {
  const m = /(\d{1,2})\s*h/.exec(khungGio);
  if (m) {
    const g = Number(m[1]);
    if (g >= 0 && g <= 23) return g;
  }
  // 'Giờ nào cũng được' không có số nào. Nhắc lúc 9 giờ, đầu ngày làm việc.
  return 9;
}

/** Dựng mốc theo giờ MÁY từ 'yyyy-mm-dd'. Null nếu chuỗi không đúng khuôn. */
export function moc(ngay: string, gio: number, phut = 0): Date | null {
  const [n, t, g] = ngay.split('-').map(Number);
  if (!n || !t || !g) return null;
  const d = new Date(n, t - 1, g, gio, phut, 0, 0);
  // Ngày 31/2 thì Date tự trôi sang tháng sau. Bắt lại chứ đừng nhắc bừa.
  if (d.getFullYear() !== n || d.getMonth() !== t - 1 || d.getDate() !== g) return null;
  return d;
}

/**
 * Hai mốc nhắc cho một buổi hẹn: tối hôm trước lúc 20h, và trước giờ hẹn một
 * tiếng.
 *
 * Tối hôm trước để còn kịp sắp xếp; trước một tiếng để khỏi quên lúc đang bận.
 * Không nhắc đúng giờ hẹn — nhắc lúc đó thì đã muộn.
 */
export function mocNhac(
  ngayHen: string,
  khungGio: string
): { homTruoc: Date; truocMotTieng: Date } | null {
  const batDau = moc(ngayHen, gioBatDau(khungGio));
  const homTruoc = moc(ngayHen, 20);
  if (!batDau || !homTruoc) return null;
  homTruoc.setDate(homTruoc.getDate() - 1);
  return { homTruoc, truocMotTieng: new Date(batDau.getTime() - 60 * 60 * 1000) };
}
