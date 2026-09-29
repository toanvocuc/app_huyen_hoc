/** Đọc nội dung từ cơ sở dữ liệu. Nội dung viết sẵn một lần rồi dùng mãi, không gọi AI. */

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
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
