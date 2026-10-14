/** Đọc nội dung từ cơ sở dữ liệu. Nội dung viết sẵn một lần rồi dùng mãi, không gọi AI. */

import { useEffect, useState } from 'react';

import {
  MAU_CON_SO_BIEU_DO,
  MAU_CUNG,
  MAU_DO_HOP,
  MAU_LA_BAI,
  MAU_MUI_TEN_BIEU_DO,
  MAU_SO_CHU_DAO,
  MAU_SO_VAN_MENH,
  MAU_CHUYEN_GIA,
  MAU_TU_VI,
} from '@/data/noi-dung-mau';
import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';
import type { LaBai } from '@/lib/tarot';

type DongLaBai = {
  ma: string;
  bo: LaBai['bo'];
  so: number;
  ten_vi: string;
  ten_en: string;
  tu_khoa: string;
  y_nghia_xuoi: string;
  y_nghia_nguoc: string;
  tinh_cam: string;
  cong_viec: string;
  loi_khuyen: string;
};

function doiTen(d: DongLaBai): LaBai {
  return {
    ma: d.ma,
    bo: d.bo,
    so: d.so,
    tenVi: d.ten_vi,
    tenEn: d.ten_en,
    tuKhoa: d.tu_khoa,
    yNghiaXuoi: d.y_nghia_xuoi,
    yNghiaNguoc: d.y_nghia_nguoc,
    tinhCam: d.tinh_cam,
    congViec: d.cong_viec,
    loiKhuyen: d.loi_khuyen,
  };
}

export function useBoBai() {
  const [boBai, setBoBai] = useState<LaBai[] | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    if (XEM_THU) {
      setBoBai(MAU_LA_BAI);
      return;
    }
    let huy = false;
    supabase
      .from('la_bai')
      .select('*')
      .then(({ data, error }) => {
        if (huy) return;
        if (error) {
          setLoi(error.message);
          return;
        }
        setBoBai((data as DongLaBai[]).map(doiTen));
      });
    return () => {
      huy = true;
    };
  }, []);

  return { boBai, loi, dangTai: boBai === null && loi === null };
}

// ---------------------------------------------------------------- chiêm tinh và thần số

export type NoiDungCung = {
  ma: string;
  ten: string;
  ten_en: string;
  tu_ngay: string;
  den_ngay: string;
  nguyen_to: string;
  tinh_chat: string;
  tinh_cach: string;
  diem_manh: string;
  diem_yeu: string;
};

export type DongHop = {
  cung_a: string;
  cung_b: string;
  diem: number;
  loi_binh: string;
  diem_manh: string | null;
  diem_yeu: string | null;
  loi_khuyen: string | null;
};
export type DongSoChuDao = {
  so: number;
  ten: string;
  tinh_cach: string;
  diem_manh: string;
  diem_yeu: string;
  loi_khuyen: string;
};
export type DongSoVanMenh = { so: number; ten: string; y_nghia: string; loi_khuyen: string };

export type DongMuiTen = {
  ma: string;
  cac_so: string;
  loai: 'day' | 'trong';
  ten: string;
  y_nghia: string;
  loi_khuyen: string;
};
export type DongTuVi = {
  ky: 'ngay' | 'tuan';
  muc: 'tong_quan' | 'tinh_cam' | 'cong_viec' | 'suc_khoe';
  cung: string;
  thu_tu: number;
  noi_dung: string;
};
export type DongConSo = {
  so: number;
  ten: string;
  khi_thieu: string;
  khi_co: string;
  khi_nhieu: string;
};

/**
 * Hồ sơ thầy tư vấn.
 *
 * Mọi ô ngoài mã, tên và lời giới thiệu đều có thể trống: lúc mới dựng thì chưa
 * hỏi được thầy giá bao nhiêu, chưa có ảnh. Màn hình phải vẽ được cả khi thiếu
 * gần hết, chứ không chờ đủ mới hiện.
 */
export type DongChuyenGia = {
  ma: string;
  ten: string;
  anh: string | null;
  nam_kinh_nghiem: number | null;
  chuyen_sau: string | null;
  hoc_tu: string | null;
  so_nguoi_da_xem: number | null;
  gioi_thieu: string;
  gia_tu: number | null;
  gom_gi: string | null;
  thoi_gian_tra_loi: string | null;
  gio_lam_viec: string | null;
  zalo: string | null;
  /** Trang công khai của thầy, ví dụ TikTok. Để khách tự kiểm chứng người thật. */
  trang_ca_nhan: string | null;
  dang_nhan: boolean;
  thu_tu: number;
  /** Máy chủ tự tính lại mỗi khi có đánh giá mới. Null khi chưa ai chấm. */
  diem_tb: number | null;
  so_danh_gia: number;
};

const MAU_BANG: Record<string, unknown[]> = {
  cung_hoang_dao: MAU_CUNG,
  do_hop_cung: MAU_DO_HOP,
  so_chu_dao: MAU_SO_CHU_DAO,
  so_van_menh: MAU_SO_VAN_MENH,
  mui_ten_bieu_do: MAU_MUI_TEN_BIEU_DO,
  con_so_bieu_do: MAU_CON_SO_BIEU_DO,
  tu_vi_mau: MAU_TU_VI,
  chuyen_gia: MAU_CHUYEN_GIA,
};

function useBang<T>(bang: string) {
  const [dong, setDong] = useState<T[] | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    if (XEM_THU) {
      setDong(MAU_BANG[bang] as T[]);
      return;
    }
    let huy = false;

    /**
     * Bọc try/catch chứ không nối `.catch`.
     *
     * Thứ `supabase.from().select()` trả về không phải một lời hứa thật, chỉ là
     * một vật có hàm `then`, nên nó KHÔNG có `.catch` để nối vào — trình biên
     * dịch báo thẳng ra điều đó. Và `dangTai` tính bằng "chưa có dòng nào VÀ
     * chưa có lỗi nào", nên vật đó mà vỡ thì cả hai ô cùng ở null và vòng xoay
     * quay mãi, đúng hình dạng con bug đã sửa ở màn thông báo.
     */
    (async () => {
      try {
        const { data, error } = await supabase.from(bang).select('*');
        if (huy) return;
        if (error) setLoi(error.message);
        else setDong(data as T[]);
      } catch (e) {
        if (huy) return;
        setLoi(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      huy = true;
    };
  }, [bang]);

  return { dong, loi, dangTai: dong === null && loi === null };
}

export const useCung = () => useBang<NoiDungCung>('cung_hoang_dao');
export const useDoHop = () => useBang<DongHop>('do_hop_cung');
export const useSoChuDao = () => useBang<DongSoChuDao>('so_chu_dao');
export const useSoVanMenh = () => useBang<DongSoVanMenh>('so_van_menh');
export const useMuiTen = () => useBang<DongMuiTen>('mui_ten_bieu_do');
export const useConSo = () => useBang<DongConSo>('con_so_bieu_do');
export const useTuVi = () => useBang<DongTuVi>('tu_vi_mau');

/** Thầy đang nhận khách, xếp theo thứ tự đã định. */
export function useChuyenGia() {
  const { dong, loi, dangTai } = useBang<DongChuyenGia>('chuyen_gia');
  const ds = dong
    ? [...dong].filter((t) => t.dang_nhan).sort((a, b) => a.thu_tu - b.thu_tu)
    : null;
  return { dong: ds, loi, dangTai };
}
