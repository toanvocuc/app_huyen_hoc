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
  /** Ngày khách muốn gặp, dạng yyyy-mm-dd. Null với đơn đặt trước khi có mục này. */
  ngay_hen: string | null;
  cau_hoi: string;
  trang_thai: TrangThai;
  /** Lý do thầy từ chối, thầy tự viết. Chỉ có khi trạng thái là da_huy. */
  ly_do: string | null;
  tao_luc: string;
  /** Ảnh chụp tên khách lúc đặt. Null với mấy đơn đặt trước khi có cột này. */
  ten_khach: string | null;
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
 * Dữ liệu mẫu cho chế độ xem thử. Đủ bốn trạng thái và hai thầy, để màn Lịch của
 * tôi bày ra được cả phần đang chờ, phần lịch sử lẫn mấy cách sắp xếp — chụp ảnh
 * nộp chợ cũng dùng chính bộ này.
 */
const NGAY_TRUOC = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const MAU_YEU_CAU: YeuCau[] = [
  {
    ma: 'xem-thu-1',
    chuyen_gia: 'luna-chiem-tinh',
    nguoi_dung: 'xem-thu-khach',
    chu_de: 'Tarot',
    khung_gio: 'Tối, 19h tới 21h',
    ngay_hen: null,
    cau_hoi: 'Em đang phân vân giữa hai lời mời làm việc, không biết chọn bên nào.',
    trang_thai: 'da_nhan',
    ly_do: null,
    tao_luc: NGAY_TRUOC(0),
    ten_khach: 'Nguyễn Thị Ánh Đào',
  },
  {
    ma: 'xem-thu-2',
    chuyen_gia: 'luna-chiem-tinh',
    nguoi_dung: 'xem-thu-khach',
    chu_de: 'Chiêm tinh',
    khung_gio: 'Sáng, 9h tới 11h',
    ngay_hen: null,
    cau_hoi: 'Em muốn hiểu rõ hơn về số chủ đạo của mình và nó nói gì về công việc.',
    trang_thai: 'cho_nhan',
    ly_do: null,
    tao_luc: NGAY_TRUOC(1),
    ten_khach: 'Trần Minh Quân',
  },
  {
    ma: 'xem-thu-3',
    chuyen_gia: 'luna-chiem-tinh',
    nguoi_dung: 'xem-thu-khach',
    chu_de: 'Tử vi',
    khung_gio: 'Chiều, 14h tới 16h',
    ngay_hen: null,
    cau_hoi: 'Năm nay nhà em tính chuyển chỗ ở, em muốn hỏi xem nên đi hay nên ở lại.',
    trang_thai: 'da_xong',
    ly_do: null,
    tao_luc: NGAY_TRUOC(9),
    ten_khach: 'Lê Hoàng Vũ',
  },
  {
    ma: 'xem-thu-4',
    chuyen_gia: 'luna-chiem-tinh',
    nguoi_dung: 'xem-thu-khach',
    chu_de: 'Chiêm tinh',
    khung_gio: 'Giờ nào cũng được',
    ngay_hen: null,
    cau_hoi: 'Em đặt thử rồi lại bận mất, xin phép huỷ ạ.',
    trang_thai: 'da_huy',
    ly_do: null,
    tao_luc: NGAY_TRUOC(14),
    ten_khach: 'Phạm Thu Hằng',
  },
];

/** Gửi một yêu cầu mới. Trả về dòng vừa ghi. */
export async function guiYeuCau(phan: {
  chuyenGia: string;
  chuDe: string;
  khungGio: string;
  ngayHen: string;
  cauHoi: string;
  /** Tên khách, chép sang đơn để thầy biết xưng hô với ai. */
  tenKhach?: string | null;
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
      ngay_hen: phan.ngayHen,
      cau_hoi: phan.cauHoi.trim(),
      ten_khach: phan.tenKhach?.trim() || null,
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
 * Luật khoá dòng chặn thầy lùi về 'cho_nhan' và chặn sửa câu hỏi hay khung giờ —
 * mấy thứ đó là lời của khách. Ở đây chỉ nhận ba trạng thái hợp lệ cho đúng.
 */
export async function thayDoiTrangThai(
  ma: string,
  trangThai: 'da_nhan' | 'da_xong' | 'da_huy',
  lyDo?: string
) {
  const { error } = await supabase
    .from('yeu_cau_tu_van')
    .update({ trang_thai: trangThai, ...(lyDo ? { ly_do: lyDo.trim() } : {}) })
    .eq('ma', ma);
  if (error) throw error;
}
