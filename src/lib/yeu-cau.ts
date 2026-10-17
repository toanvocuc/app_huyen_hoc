/**
 * Yêu cầu tư vấn: khách gửi, rồi theo dõi nó đi tới đâu.
 *
 * Đây là chức năng CHÍNH của app sau khi đổi trục, nên nó phải chạy trọn vẹn
 * trong app. Trước đây bấm vào thầy là mở thẳng Zalo — làm vậy thì app chỉ còn
 * là lối tắt sang ứng dụng khác, không có việc gì của riêng mình.
 *
 * Zalo vẫn còn, nhưng lùi xuống làm bước cuối: gửi yêu cầu xuống máy chủ xong
 * mới mở Zalo để thầy trả lời. Hỏng bước Zalo thì yêu cầu vẫn nằm đó, thầy vẫn
 * thấy, khách vẫn theo dõi được.
 */

import { useCallback, useEffect, useState } from 'react';

import { maNguoiDung, supabase } from '@/lib/supabase';
import { XEM_THU, XEM_THU_THAY } from '@/lib/xem-thu';

export type TrangThai = 'cho_nhan' | 'da_nhan' | 'da_xong' | 'da_huy';

export type YeuCau = {
  ma: string;
  chuyen_gia: string;
  /** Mã khách. Phía thầy dùng nó để mở hồ sơ khách; phía khách không cần tới. */
  nguoi_dung: string;
  chu_de: string;
  khung_gio: string;
  /**
   * Giờ hẹn chính xác dạng 'HH:mm'.
   *
   * Null nghĩa là khách chọn khung giờ chung chung, hoặc đơn đặt từ trước khi có
   * mục này. Mọi chỗ đọc đều phải có đường lùi về `khung_gio`.
   */
  gio_hen: string | null;
  /** Ngày khách muốn gặp, dạng yyyy-mm-dd. Null với đơn đặt trước khi có mục này. */
  ngay_hen: string | null;
  cau_hoi: string;
  trang_thai: TrangThai;
  /** Lý do thầy từ chối, thầy tự viết. Chỉ có khi trạng thái là da_huy. */
  ly_do: string | null;
  tao_luc: string;
  /** Ảnh chụp tên khách lúc đặt. Null với mấy đơn đặt trước khi có cột này. */
  ten_khach: string | null;
  /**
   * Gói khách chọn, chụp lại tên và giá ngay lúc đặt.
   *
   * Không đọc qua khoá ngoại: thầy tăng giá tháng sau thì đơn cũ phải còn nguyên
   * giá đã thoả thuận. Null với đơn đặt trước khi có bảng gói.
   */
  goi: string | null;
  gia_goi: number | null;
};

/** Khung giờ cho sẵn. Cố ý không cho chọn ngày giờ chính xác, xem migration 0011. */
export const KHUNG_GIO = [
  'Sáng, 9h tới 11h',
  'Chiều, 14h tới 16h',
  'Tối, 19h tới 21h',
  'Giờ nào cũng được',
] as const;

/** Chữ hiện ra cho từng trạng thái, kèm màu để màn danh sách khỏi tự chế. */
export const TEN_TRANG_THAI: Record<TrangThai, { chu: string; y: 'cho' | 'xong' | 'huy' }> = {
  cho_nhan: { chu: 'Chờ thầy nhận', y: 'cho' },
  da_nhan: { chu: 'Thầy đã nhận', y: 'cho' },
  da_xong: { chu: 'Đã tư vấn xong', y: 'xong' },
  da_huy: { chu: 'Đã huỷ', y: 'huy' },
};

/** Chủ đề của một thầy, tách từ cột chuyen_sau. */
export function tachChuDe(chuyenSau: string | null | undefined): string[] {
  return (chuyenSau ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * '2026-10-20' thành '20/10'.
 *
 * Tách chuỗi chứ KHÔNG qua `new Date`: `new Date('2026-10-20')` được hiểu theo
 * UTC, nên ở Việt Nam in ra lùi một ngày. Hai màn cùng dùng hàm này — để mỗi
 * màn tự viết một bản thì sớm muộn có một bản dùng Date và lệch ngày.
 */
export function ngayHenGon(ngay: string | null | undefined): string | null {
  if (!ngay) return null;
  const [, t, g] = ngay.split('-');
  if (!t || !g) return null;
  return `${Number(g)}/${Number(t)}`;
}

/**
 * Dữ liệu mẫu cho chế độ xem thử. Đủ bốn trạng thái và hai thầy, để màn Lịch của
 * tôi bày ra được cả phần đang chờ, phần lịch sử lẫn mấy cách sắp xếp — chụp ảnh
 * nộp chợ cũng dùng chính bộ này.
 */
const NGAY_TRUOC = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** yyyy-mm-dd cách hôm nay n ngày, theo giờ máy. */
const NGAY_HEN = (n: number) => {
  const d = new Date(Date.now() + n * 86400000);
  const hai = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`;
};

const MAU_YEU_CAU: YeuCau[] = [
  {
    ma: 'xem-thu-1',
    chuyen_gia: 'luna-chiem-tinh',
    nguoi_dung: 'xem-thu-khach',
    chu_de: 'Tarot',
    khung_gio: 'Tối, 19h tới 21h',
    gio_hen: '19:30',
    ngay_hen: NGAY_HEN(2),
    cau_hoi: 'Em đang phân vân giữa hai lời mời làm việc, không biết chọn bên nào.',
    trang_thai: 'da_nhan',
    ly_do: null,
    tao_luc: NGAY_TRUOC(0),
    ten_khach: 'Nguyễn Thị Ánh Đào',
    goi: 'Buổi 30 phút',
    gia_goi: 300000,
  },
  {
    ma: 'xem-thu-2',
    chuyen_gia: 'luna-chiem-tinh',
    nguoi_dung: 'xem-thu-khach',
    chu_de: 'Chiêm tinh',
    khung_gio: 'Sáng, 9h tới 11h',
    gio_hen: null,
    ngay_hen: NGAY_HEN(5),
    cau_hoi: 'Em muốn hiểu rõ hơn về số chủ đạo của mình và nó nói gì về công việc.',
    trang_thai: 'cho_nhan',
    ly_do: null,
    tao_luc: NGAY_TRUOC(1),
    ten_khach: 'Trần Minh Quân',
    goi: 'Một câu hỏi cụ thể',
    gia_goi: 150000,
  },
  {
    ma: 'xem-thu-3',
    chuyen_gia: 'luna-chiem-tinh',
    nguoi_dung: 'xem-thu-khach',
    chu_de: 'Tử vi',
    khung_gio: 'Chiều, 14h tới 16h',
    gio_hen: '14:00',
    ngay_hen: NGAY_HEN(-7),
    cau_hoi: 'Năm nay nhà em tính chuyển chỗ ở, em muốn hỏi xem nên đi hay nên ở lại.',
    trang_thai: 'da_xong',
    ly_do: null,
    tao_luc: NGAY_TRUOC(9),
    ten_khach: 'Lê Hoàng Vũ',
    goi: 'Buổi 60 phút',
    gia_goi: 500000,
  },
  {
    ma: 'xem-thu-4',
    chuyen_gia: 'luna-chiem-tinh',
    nguoi_dung: 'xem-thu-khach',
    chu_de: 'Chiêm tinh',
    khung_gio: 'Giờ nào cũng được',
    gio_hen: null,
    ngay_hen: NGAY_HEN(-12),
    cau_hoi: 'Em muốn xem bản đồ sao của hai vợ chồng em xem có hợp nhau không.',
    trang_thai: 'da_huy',
    // Đơn này cố ý là đơn THẦY TỪ CHỐI, kèm lý do thầy viết tay. Thiếu nó
    // thì cả bộ mẫu không có dòng nào đi qua đường `ly_do`, mà đó là đường
    // duy nhất cho khách biết vì sao đơn của mình không được nhận.
    ly_do: 'Tuần này mình đi xa nên chưa nhận thêm đơn nào được. Bạn đặt lại giúp mình tuần sau nhé, mình ưu tiên xếp sớm cho bạn.',
    tao_luc: NGAY_TRUOC(14),
    ten_khach: 'Phạm Thu Hằng',
    goi: 'Buổi 30 phút',
    gia_goi: 300000,
  },
];

/** Gửi một yêu cầu mới. Trả về dòng vừa ghi. */
export async function guiYeuCau(phan: {
  chuyenGia: string;
  chuDe: string;
  khungGio: string;
  /** Giờ chính xác 'HH:mm'. Bỏ trống khi khách chọn khung giờ. */
  gioHen?: string | null;
  ngayHen: string;
  cauHoi: string;
  /** Tên khách, chép sang đơn để thầy biết xưng hô với ai. */
  tenKhach?: string | null;
  /** Tên và giá gói lúc đặt. Bỏ trống với thầy chưa khai gói nào. */
  goi?: string | null;
  giaGoi?: number | null;
}): Promise<YeuCau> {
  if (XEM_THU) return { ...MAU_YEU_CAU[0], ...{ trang_thai: 'cho_nhan' as const } };

  const toi = await maNguoiDung();
  if (!toi) throw new Error('Chưa đọc được tài khoản. Kiểm tra mạng rồi thử lại.');

  const { data, error } = await supabase
    .from('yeu_cau_tu_van')
    .insert({
      chuyen_gia: phan.chuyenGia,
      nguoi_dung: toi,
      chu_de: phan.chuDe,
      khung_gio: phan.khungGio,
      gio_hen: phan.gioHen?.trim() || null,
      ngay_hen: phan.ngayHen,
      cau_hoi: phan.cauHoi.trim(),
      ten_khach: phan.tenKhach?.trim() || null,
      goi: phan.goi?.trim() || null,
      gia_goi: phan.giaGoi ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as YeuCau;
}

/** Khách tự huỷ, chỉ được khi thầy chưa nhận. Luật khoá dòng cũng chặn thêm một lớp. */
export async function huyYeuCau(ma: string) {
  if (XEM_THU) return;
  const { error } = await supabase
    .from('yeu_cau_tu_van')
    .update({ trang_thai: 'da_huy' })
    .eq('ma', ma);
  if (error) throw error;
}

/** Danh sách yêu cầu của chính mình, mới nhất lên trước. */
export function useYeuCauCuaToi() {
  // Chế độ xem thử nạp sẵn ngay lúc dựng chứ không đặt trong hiệu ứng: đặt
  // trạng thái ngay trong thân hiệu ứng là kéo thêm một vòng vẽ thừa, eslint bắt.
  const [dong, datDong] = useState<YeuCau[] | null>(XEM_THU ? MAU_YEU_CAU : null);
  const [loi, datLoi] = useState<string | null>(null);

  const taiLai = useCallback(() => {
    if (XEM_THU) return;
    // Bọc try/catch chứ không nối .catch: thứ postgrest trả về không phải lời
    // hứa thật nên không có .catch, và `dangTai` tính bằng "chưa có dòng VÀ chưa
    // có lỗi" nên vỡ mà không bắt là vòng xoay quay mãi.
    (async () => {
      try {
        const toi = await maNguoiDung();
        if (!toi) {
          datLoi('Chưa đọc được tài khoản. Kiểm tra mạng giúp tôi.');
          return;
        }
        const { data, error } = await supabase
          .from('yeu_cau_tu_van')
          .select('*')
          .eq('nguoi_dung', toi)
          .order('tao_luc', { ascending: false });
        if (error) datLoi(error.message);
        else datDong(data as YeuCau[]);
      } catch (e) {
        datLoi(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  useEffect(taiLai, [taiLai]);

  const lamMoi = useCallback(() => {
    if (XEM_THU) return;
    datDong(null);
    datLoi(null);
    taiLai();
  }, [taiLai]);

  return { dong, loi, dangTai: dong === null && loi === null, lamMoi };
}

// ------------------------------------------------------------------ phía thầy

/**
 * Mọi đơn gửi cho thầy đang đăng nhập.
 *
 * Luật khoá dòng lo phần "của ai": thầy chỉ đọc được đơn trỏ về hồ sơ mình làm
 * chủ. Nên câu truy vấn ở đây không cần lọc gì thêm, và cũng không được phép
 * tin vào việc lọc ở máy khách.
 */
export function useDonChoThay() {
  // Chế độ xem thử nạp sẵn ngay lúc dựng chứ không đặt trong hiệu ứng: đặt
  // trạng thái ngay trong thân hiệu ứng là kéo thêm một vòng vẽ thừa, eslint bắt.
  const [dong, datDong] = useState<YeuCau[] | null>(XEM_THU_THAY ? MAU_YEU_CAU : null);
  const [loi, datLoi] = useState<string | null>(null);

  const taiLai = useCallback(() => {
    if (XEM_THU_THAY) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('yeu_cau_tu_van')
          .select('*')
          .order('tao_luc', { ascending: false });
        if (error) datLoi(error.message);
        else datDong(data as YeuCau[]);
      } catch (e) {
        datLoi(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  useEffect(taiLai, [taiLai]);

  const lamMoi = useCallback(() => {
    if (XEM_THU_THAY) return;
    datDong(null);
    datLoi(null);
    taiLai();
  }, [taiLai]);

  return { dong, loi, dangTai: dong === null && loi === null, lamMoi };
}

/**
 * Thầy đổi trạng thái một đơn.
 *
 * Luật khoá dòng chỉ chặn được hai việc: thầy lạ không đụng được đơn người
 * khác, và trạng thái mới phải nằm trong ba giá trị cho phép. Nó KHÔNG chặn
 * được việc sửa câu hỏi hay khung giờ, vì `with check` của Postgres không đọc
 * được giá trị cũ để mà so. Chỗ lo việc đó là trigger `giu_loi_cua_khach`
 * ở migration 0022 — chạy trước mọi lệnh sửa và gán lại mọi ô của khách bằng
 * giá trị cũ.
 *
 * Trước migration đó thì thật sự có lỗ hỏng, và chú thích cũ ở đây lại nói là
 * đã được chặn: đơn đang 'cho_nhan' thì mọi lệnh sửa đều trượt, nhưng trượt
 * nhờ may — và thầy nhận đơn xong là sửa được hết.
 */
export async function thayDoiTrangThai(
  ma: string,
  trangThai: 'da_nhan' | 'da_xong' | 'da_huy',
  lyDo?: string
) {
  const { error } = await supabase
    .from('yeu_cau_tu_van')
    // Xét sau khi cắt trắng chứ không xét chuỗi thô: mấy dấu cách cũng là giá trị
    // đúng, nên dòng cũ ghi xuống máy chủ một ô lý do rỗng thay vì bỏ trống nó.
    .update({ trang_thai: trangThai, ...(lyDo?.trim() ? { ly_do: lyDo.trim() } : {}) })
    .eq('ma', ma);
  if (error) throw error;
}
