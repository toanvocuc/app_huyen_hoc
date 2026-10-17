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

/**
 * Tách 'HH:mm' thành giờ và phút. Null nếu trống hoặc sai khuôn.
 *
 * Khách chọn giờ chính xác thì ô này có giá trị; chọn khung giờ chung chung thì
 * trống, và mọi chỗ đọc đều lùi về `khung_gio` như cũ.
 */
export function tachGioHen(gioHen: string | null | undefined): { gio: number; phut: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec((gioHen ?? '').trim());
  if (!m) return null;
  const gio = Number(m[1]);
  const phut = Number(m[2]);
  if (gio < 0 || gio > 23 || phut < 0 || phut > 59) return null;
  return { gio, phut };
}

/** Giờ bắt đầu khung, suy từ chính chuỗi khách đã chọn. */
export function gioBatDau(khungGio: string): number {
  // Hiểu cả dạng 'HH:mm'. Khách chọn giờ chính xác thì ô `khung_gio` nhận luôn
  // chuỗi đó (cột bắt buộc có), nên không hiểu là rơi về 9h một cách vô lý.
  const cx = tachGioHen(khungGio);
  if (cx) return cx.gio;

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

/** 'HH:mm' để hiện ra màn hình. Trả null nếu không có giờ chính xác. */
export function gioDoc(gioHen: string | null | undefined): string | null {
  const t = tachGioHen(gioHen);
  if (!t) return null;
  return `${String(t.gio).padStart(2, '0')}:${String(t.phut).padStart(2, '0')}`;
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
  khungGio: string,
  gioHen?: string | null
): { homTruoc: Date; truocMotTieng: Date } | null {
  const cx = tachGioHen(gioHen);
  const batDau = cx
    ? moc(ngayHen, cx.gio, cx.phut)
    : moc(ngayHen, gioBatDau(khungGio));
  const homTruoc = moc(ngayHen, 20);
  if (!batDau || !homTruoc) return null;
  homTruoc.setDate(homTruoc.getDate() - 1);
  return { homTruoc, truocMotTieng: new Date(batDau.getTime() - 60 * 60 * 1000) };
}

// ------------------------------------------------- khoảng giờ đặt lịch được

/** Sớm nhất nhận tư vấn. Không ai làm việc lúc một hai giờ sáng. */
export const GIO_SOM = 9;

/** Muộn nhất nhận tư vấn. */
export const GIO_MUON = 21;

/**
 * Đặt trước ít nhất bao nhiêu tiếng, tính cho buổi hẹn trong ngày hôm nay.
 *
 * Không cho đặt sát giờ: thầy phải kịp thấy đơn, kịp nhận, kịp sắp xếp. Mà
 * khách bấm xong rồi ngồi chờ mười phút thì cũng chẳng vui gì.
 */
const DAT_TRUOC = 1;

/**
 * Giờ sớm nhất còn chọn được cho một ngày.
 *
 * Ngày mai trở đi thì cứ từ GIO_SOM. Riêng HÔM NAY phải lùi theo đồng hồ, không
 * thì bây giờ 8 giờ tối mà khách vẫn đặt được buổi 9 giờ sáng — một buổi hẹn
 * nằm trong quá khứ, và không ai báo gì cả.
 *
 * Trả về số lớn hơn GIO_MUON nghĩa là hôm nay hết giờ, phải chọn ngày khác.
 */
export function gioSomNhat(ngayHen: string, bayGio = new Date()): number {
  const hai = (n: number) => String(n).padStart(2, '0');
  const homNay = `${bayGio.getFullYear()}-${hai(bayGio.getMonth() + 1)}-${hai(bayGio.getDate())}`;
  if (ngayHen !== homNay) return GIO_SOM;
  return Math.max(GIO_SOM, bayGio.getHours() + DAT_TRUOC);
}

/** Hôm nay đã hết giờ nhận chưa. */
export function hetGioHomNay(ngayHen: string, bayGio = new Date()): boolean {
  return gioSomNhat(ngayHen, bayGio) > GIO_MUON;
}

/**
 * Khung giờ cho sẵn này còn đặt được cho ngày đó không.
 *
 * Cùng một lý do: 8 giờ tối rồi thì khung 'Sáng, 9h tới 11h' của hôm nay đã
 * trôi qua. Chặn luôn ở đây để khách không bấm vào được.
 */
export function khungConDat(khungGio: string, ngayHen: string, bayGio = new Date()): boolean {
  // So với giờ KẾT THÚC khung, không phải giờ bắt đầu.
  //
  // Bản đầu tôi so với giờ bắt đầu nên 20 giờ là chặn luôn khung 'Tối, 19h tới
  // 21h' — trong khi buổi lúc 21 giờ vẫn đặt được bình thường. Khung chỉ thật sự
  // trôi qua khi đuôi của nó cũng đã qua.
  return gioKetThuc(khungGio) >= gioSomNhat(ngayHen, bayGio);
}

/**
 * Giờ kết thúc của một khung.
 *
 * 'Sáng, 9h tới 11h' ra 11. Chuỗi không có đuôi, như 'Giờ nào cũng được' hay
 * một giờ chính xác, thì lấy chính giờ bắt đầu — trừ 'Giờ nào cũng được', vì
 * nó nghĩa là rảnh cả ngày nên kéo tới giờ muộn nhất.
 */
export function gioKetThuc(khungGio: string): number {
  if (tachGioHen(khungGio)) return gioBatDau(khungGio);
  const ds = [...khungGio.matchAll(/(\d{1,2})\s*h/g)].map((m) => Number(m[1]));
  if (ds.length >= 2) return ds[ds.length - 1];
  if (ds.length === 1) return ds[0];
  // Không có số nào: 'Giờ nào cũng được'.
  return GIO_MUON;
}
