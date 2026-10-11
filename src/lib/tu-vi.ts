/**
 * Chọn bài tử vi hằng ngày và hằng tuần cho một cung.
 *
 * Bài viết sẵn nằm trong bảng `tu_vi_mau`. Ở đây chỉ chọn, không sinh ra chữ nào,
 * và chọn bằng phép tính thuần nên cùng một ngày với cùng một cung thì lúc nào
 * cũng ra đúng một bài. Mở app mười lần trong ngày vẫn thấy y nguyên, đó là điều
 * khách mong đợi ở một lá tử vi.
 */

import type { DongTuVi } from '@/lib/kho-noi-dung';
import type { MaCung } from '@/lib/zodiac';

/**
 * Thứ tự 12 cung, chép lại từ zodiac.ts.
 *
 * Chép ra đây để file này không cần nạp thứ gì lúc chạy, nhờ vậy bộ kiểm thử gọi
 * thẳng được bằng Node mà không cần dựng cả Metro. Hai dòng `import type` bên
 * trên bị xoá sạch lúc biên dịch nên không tính.
 *
 * Lệch thứ tự so với zodiac.ts là chọn sai bài cho cả 12 cung, mà sai kiểu đó
 * không ai nhìn ra. Trong kiem-tra/logic.ts có một phép so hai danh sách này.
 */
const THU_TU_CUNG: readonly string[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

export const THU_TU_CUNG_DE_KIEM = THU_TU_CUNG;

export type MucTuVi = 'tong_quan' | 'tinh_cam' | 'cong_viec' | 'suc_khoe';

/**
 * Băm một chuỗi thành số, kiểu FNV-1a.
 *
 * Bản đầu tôi trộn bằng phép nhân cộng kiểu `moc * 17 + viTriCung * 53`. Cách đó
 * cho ra dãy đều tăm tắp: số may mắn của 12 cung chạy 9, 8, 7, 6, 5... còn điểm
 * sao thì lặp 2, 3, 4, 5 theo đúng thứ tự cung. Khách xem hai ba cung là nhận ra.
 * Băm thì rải đều, không còn thấy quy luật.
 */
function bam(chuoi: string): number {
  let h = 2166136261;
  for (let i = 0; i < chuoi.length; i++) {
    h ^= chuoi.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Ngày theo giờ Việt Nam, trả về dạng yyyy-mm-dd. */
export function ngayVN(luc: Date = new Date()): string {
  // Lấy mốc UTC rồi cộng 7 tiếng. Không dùng toLocaleDateString vì máy khách có
  // thể đặt múi giờ khác, mà lá tử vi thì phải đổi lúc nửa đêm giờ Việt Nam.
  const t = new Date(luc.getTime() + 7 * 3600 * 1000);
  return t.toISOString().slice(0, 10);
}

/** Số thứ tự của ngày, đếm từ 1970-01-01 theo giờ Việt Nam. */
export function soNgay(luc: Date = new Date()): number {
  const [n, t, g] = ngayVN(luc).split('-').map(Number);
  return Math.floor(Date.UTC(n, t - 1, g) / 86400000);
}

/**
 * Số thứ tự của tuần. Tuần bắt đầu từ thứ hai.
 *
 * 1970-01-01 rơi vào thứ năm, nên cộng 3 để mốc rơi đúng vào đầu tuần. Thiếu
 * phần cộng này thì tử vi tuần đổi vào thứ năm, giữa tuần, rất khó hiểu.
 */
export function soTuan(luc: Date = new Date()): number {
  return Math.floor((soNgay(luc) + 3) / 7);
}

/**
 * Mỗi mục bước một nhịp khác nhau, để hai mục không chạy song song.
 *
 * Bốn số này đều là số nguyên tố và lớn hơn mọi kho, nên nhân với số ngày rồi
 * chia dư là đi hết lượt kho mới quay lại. Đó là điều bắt buộc: khách đọc mỗi
 * sáng mà hai hôm liền ra cùng một bài thì nhận ra ngay.
 */
const NHIP: Record<MucTuVi, number> = {
  tong_quan: 31,
  tinh_cam: 37,
  cong_viec: 41,
  suc_khoe: 43,
};

/** Ước chung lớn nhất. */
function ucln(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

/**
 * Bước nhảy mỗi ngày, chọn sao cho nguyên tố cùng nhau với cỡ kho.
 *
 * Nhân số ngày với một nhịp cố định chỉ đi hết kho khi nhịp không chung ước với
 * cỡ kho. Lúc đầu bốn nhịp đều lớn hơn mọi kho nên điều đó tự đúng, và ghi chú
 * ở trên nói vậy. Nhưng kho lớn dần: tới khi kho tổng quan đúng bằng 31 thì
 * `ngày * 31` chia dư 31 luôn ra 0, cung đó hiện đúng một bài suốt đời.
 *
 * Tính lại bước ở đây nên cỡ kho nào cũng đi hết lượt rồi mới quay lại.
 */
export function buocDi(nhip: number, co: number): number {
  for (let b = nhip % co || 1; ; b = (b % co) + 1) {
    // Luôn dừng được: ước chung của 1 với mọi số đều bằng 1.
    if (ucln(b, co) === 1) return b;
  }
}

/**
 * Chọn một bài trong kho. Kho rỗng thì trả null chứ không làm app chết.
 *
 * Hai phần cộng lại: phần theo ngày và phần theo cung.
 *
 * Phần theo ngày đi đều một bước nguyên tố cùng nhau với cỡ kho, nên đi hết kho
 * mới quay lại. Thử băm cho phần này rồi và bài kiểm bắt được: năm ngày liên
 * tiếp với kho năm bài chỉ ra ba bài, tức có hôm lặp lại bài hôm trước.
 *
 * Phần theo cung TRƯỚC ĐÂY cũng băm, và đó là một lỗi. Băm thì hai cung khác
 * nhau vẫn có thể cho ra cùng một số dư, nên mỗi ngày có chừng hai trong mười
 * hai cung đọc ra chữ y hệt. Mục tình cảm, công việc, sức khoẻ không có bài
 * riêng cho từng cung nên cả mười hai cùng bốc một rổ, lỗi này lộ rõ nhất ở đó:
 * hai người bạn khác cung ngồi so điện thoại là thấy ngay.
 *
 * Giờ dùng bước nhảy thay cho băm. Nhân thứ tự cung với một bước nguyên tố cùng
 * nhau với cỡ kho thì mười hai tích đó chắc chắn khác nhau — không còn chuyện
 * may rủi. Kho nhỏ hơn mười hai thì trùng là không tránh được, nhưng không kho
 * nào nhỏ vậy.
 */
function chon(kho: DongTuVi[], moc: number, muc: MucTuVi, cung: MaCung): string | null {
  const co = kho.length;
  if (co === 0) return null;

  const buocNgay = buocDi(NHIP[muc], co);
  // Bước giữa hai cung phải khác bước ngày, không thì cung này hôm nay trùng
  // cung kế bên hôm qua — vẫn là một kiểu lặp, chỉ khó thấy hơn.
  let buocCung = buocDi(NHIP[muc] + 7, co);
  if (buocCung === buocNgay) buocCung = buocDi(buocCung + 1, co);

  const thuTu = Math.max(0, THU_TU_CUNG.indexOf(cung));
  return kho[(moc * buocNgay + thuTu * buocCung) % co].noi_dung;
}

export type BaiTuVi = {
  tongQuan: string | null;
  tinhCam: string | null;
  congViec: string | null;
  sucKhoe: string | null;
  /** Mấy con số vui, tính ra từ cùng một phép nên cũng cố định theo ngày. */
  diem: number;
  soMayMan: number;
  mauMayMan: string;
  gioTot: string;
};

const MAU_MAY_MAN = [
  'Vàng', 'Đỏ', 'Xanh lá', 'Xanh dương', 'Trắng',
  'Tím', 'Cam', 'Nâu đất', 'Hồng', 'Đen',
];

/**
 * Gom bài cho một cung vào một kỳ.
 *
 * `kho` là toàn bộ bảng tu_vi_mau. Lọc tại đây chứ không gọi riêng từng mục, vì
 * cả bảng chỉ hơn hai trăm dòng, tải một lần rẻ hơn bốn lần gọi máy chủ.
 */
export function layBaiTuVi(
  kho: DongTuVi[] | null,
  cung: MaCung,
  ky: 'ngay' | 'tuan',
  luc: Date = new Date()
): BaiTuVi {
  const moc = ky === 'ngay' ? soNgay(luc) : soTuan(luc);
  const cua = (muc: MucTuVi) =>
    (kho ?? []).filter(
      (d) => d.ky === ky && d.muc === muc && (d.cung === cung || d.cung === 'chung')
    );

  // Mỗi con số băm riêng, không cùng chung một gốc. Chung gốc thì chúng chạy song
  // song với nhau, ví dụ cung nào số may mắn cao thì giờ tốt cũng muộn theo.
  const rai = (ten: string, n: number) => bam(`${moc}|${ten}|${cung}`) % n;

  return {
    tongQuan: chon(cua('tong_quan'), moc, 'tong_quan', cung),
    tinhCam: chon(cua('tinh_cam'), moc, 'tinh_cam', cung),
    congViec: chon(cua('cong_viec'), moc, 'cong_viec', cung),
    sucKhoe: ky === 'ngay' ? chon(cua('suc_khoe'), moc, 'suc_khoe', cung) : null,
    // 2 tới 5 sao. Không cho 1 sao vì đọc mỗi sáng mà hiện 1 sao thì chỉ tổ nản.
    diem: 2 + rai('diem', 4),
    soMayMan: 1 + rai('so', 9),
    mauMayMan: MAU_MAY_MAN[rai('mau', MAU_MAY_MAN.length)],
    gioTot: `${7 + rai('gio', 12)} giờ`,
  };
}

/** Viết ngày ra kiểu người Việt đọc: "Thứ năm, ngày 2 tháng 10". */
export function ngayChu(luc: Date = new Date()): string {
  const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const [n, t, g] = ngayVN(luc).split('-').map(Number);
  const d = new Date(Date.UTC(n, t - 1, g));
  return `${THU[d.getUTCDay()]}, ngày ${g} tháng ${t}`;
}

/** Khoảng ngày của tuần đang xét: "Thứ hai 29/9 tới chủ nhật 5/10". */
export function tuanChu(luc: Date = new Date()): string {
  const dauTuan = soTuan(luc) * 7 - 3; // đảo lại phép cộng 3 ở soTuan
  const ra = (n: number) => {
    const d = new Date(n * 86400000);
    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  };
  return `${ra(dauTuan)} tới ${ra(dauTuan + 6)}`;
}
