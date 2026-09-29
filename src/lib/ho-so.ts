/** Hồ sơ người dùng: đọc, ghi, xoá. Mỗi người chỉ đụng được vào dòng của mình. */

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type GioiTinh = 'nam' | 'nu' | 'khac';

export type HoSo = {
  nguoi_dung: string;
  ho_ten: string | null;
  ngay_sinh: string | null; // yyyy-mm-dd
  gio_sinh: string | null; // HH:mm
  noi_sinh: string | null;
  gioi_tinh: GioiTinh | null;
  gio_nhac: string | null;
};

export function tachNgay(ngaySinh: string | null) {
  if (!ngaySinh) return null;
  const [nam, thang, ngay] = ngaySinh.split('-').map(Number);
  if (!nam || !thang || !ngay) return null;
  return { ngay, thang, nam };
}

/** Kiểm dữ liệu trước khi lưu. Trả về câu báo lỗi, hoặc null nếu hợp lệ. */
export function kiemNgaySinh(ngay: number, thang: number, nam: number): string | null {
  if (!ngay || !thang || !nam) return 'Chưa nhập đủ ngày tháng năm';
  if (thang < 1 || thang > 12) return 'Tháng phải từ 1 tới 12';
  const d = new Date(nam, thang - 1, ngay);
  if (d.getFullYear() !== nam || d.getMonth() !== thang - 1 || d.getDate() !== ngay) {
    return 'Ngày này không có thật';
  }
  const homNay = new Date();
  if (d > homNay) return 'Ngày sinh không thể ở tương lai';

  let tuoi = homNay.getFullYear() - nam;
  const chuaQuaSinhNhat =
    homNay.getMonth() < thang - 1 ||
    (homNay.getMonth() === thang - 1 && homNay.getDate() < ngay);
  if (chuaQuaSinhNhat) tuoi--;
  if (tuoi < 18) return 'App dành cho người từ 18 tuổi';
  if (tuoi > 120) return 'Năm sinh có vẻ không đúng';

  return null;
}

export async function docHoSo(): Promise<HoSo | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data, error } = await supabase
    .from('ho_so')
    .select('*')
    .eq('nguoi_dung', u.user.id)
    .maybeSingle();
  if (error) throw error;
  return (data as HoSo) ?? null;
}

export async function luuHoSo(phan: Partial<HoSo>): Promise<HoSo> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error('Chưa có phiên đăng nhập');
  const { data, error } = await supabase
    .from('ho_so')
    .upsert({ ...phan, nguoi_dung: u.user.id, sua_luc: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as HoSo;
}

/** Xoá sạch dữ liệu. Dòng hồ sơ đi thì lần rút và sự kiện đi theo. */
export async function xoaSachDuLieu() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const { error } = await supabase.from('ho_so').delete().eq('nguoi_dung', u.user.id);
  if (error) throw error;
  await supabase.auth.signOut();
}

export function useHoSo() {
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [dangTai, setDangTai] = useState(true);

  const taiLai = useCallback(() => {
    setDangTai(true);
    docHoSo()
      .then(setHoSo)
      .catch((e) => console.warn('[ho-so]', e))
      .finally(() => setDangTai(false));
  }, []);

  useEffect(taiLai, [taiLai]);

  return { hoSo, dangTai, taiLai, setHoSo };
}
