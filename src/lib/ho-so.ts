/** Hồ sơ người dùng: đọc, ghi, xoá. Mỗi người chỉ đụng được vào dòng của mình. */

import { useCallback, useEffect, useState } from 'react';

import { dangNhapAnDanh, supabase } from '@/lib/supabase';
import { HO_SO_MAU, XEM_THU } from '@/lib/xem-thu';

export type GioiTinh = 'nam' | 'nu' | 'khac';

/**
 * Báo tin cho màn gốc biết đã có hồ sơ hay chưa.
 *
 * Màn gốc chỉ đọc hồ sơ một lần lúc mở app. Nhập xong năm bước mà không báo lại
 * thì nó vẫn tưởng là chưa có và đá ngược về phần nhập.
 */
type NguoiNghe = (co: boolean) => void;
const dangNghe = new Set<NguoiNghe>();
let daCoHoSo = false;

export function datCoHoSo(co: boolean) {
  daCoHoSo = co;
  dangNghe.forEach((f) => f(co));
}

export function ngheCoHoSo(f: NguoiNghe) {
  dangNghe.add(f);
  return () => {
    dangNghe.delete(f);
  };
}

export const dangCoHoSo = () => daCoHoSo;

export type HoSo = {
  nguoi_dung: string;
  ho_ten: string | null;
  ngay_sinh: string | null; // yyyy-mm-dd
  gio_sinh: string | null; // HH:mm
  noi_sinh: string | null;
  gioi_tinh: GioiTinh | null;
  gio_nhac: string | null;
  nhac_la_bai: boolean | null;
  nhac_tin_tuc: boolean | null;
};

/**
 * Một bản hồ sơ dùng chung cho cả app.
 *
 * Trước đây mỗi màn giữ bản sao riêng, đọc đúng một lần lúc dựng màn. Thẻ tab
 * không bị huỷ khi chuyển qua lại, nên sửa ngày sinh ở Cá nhân xong là màn Tử vi
 * và Thần số học vẫn tính theo ngày cũ cho tới khi tắt hẳn app rồi mở lại.
 *
 * Giờ chỉ còn một bản. Ai lưu hay xoá thì mọi màn đang mở biết ngay.
 */
let hoSoChung: HoSo | null = null;
let daDoc = false;
let dangDoc: Promise<HoSo | null> | null = null;
const ngheHoSo = new Set<(h: HoSo | null) => void>();

/** Đặt lại bản dùng chung rồi báo cho mọi màn đang mở. */
function datHoSoChung(h: HoSo | null) {
  hoSoChung = h;
  daDoc = true;
  ngheHoSo.forEach((f) => f(h));
}

/**
 * Đọc hồ sơ về bản dùng chung.
 *
 * Mở app là mấy thẻ tab dựng cùng một lúc. Gom chung một lời gọi để khỏi bắn
 * mấy lượt hỏi giống hệt nhau lên máy chủ.
 */
function docVeChung(buoc = false): Promise<HoSo | null> {
  if (dangDoc) return dangDoc;
  if (daDoc && !buoc) return Promise.resolve(hoSoChung);

  dangDoc = docHoSo()
    .then((h) => {
      dangDoc = null;
      datHoSoChung(h);
      return h;
    })
    .catch((e) => {
      // Hỏng thì KHÔNG đặt daDoc. Mất mạng lúc mở app mà đánh dấu là đã đọc thì
      // mọi màn sau đều tin rằng khách chưa có hồ sơ, và không ai thử lại nữa.
      console.warn('[ho-so]', e);
      dangDoc = null;
      return hoSoChung;
    });
  return dangDoc;
}

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
  if (XEM_THU) return HO_SO_MAU;
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
  if (XEM_THU) return { ...HO_SO_MAU, ...phan };

  // Xoá sạch dữ liệu xong là đăng xuất, mà màn gốc chỉ tạo phiên lúc mở app nên
  // không ai tạo lại. Thiếu dòng này thì khách nhập đủ năm bước, tới bước cuối
  // mới báo "Chưa có phiên đăng nhập", và mất sạch thứ vừa gõ.
  //
  // dangNhapAnDanh đọc phiên trong máy trước, chỉ tạo mới khi thật sự không có.
  // Nhờ vậy mất mạng không biến thành tạo nhầm một tài khoản trắng.
  await dangNhapAnDanh();

  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error('Chưa có phiên đăng nhập');
  const { data, error } = await supabase
    .from('ho_so')
    .upsert({ ...phan, nguoi_dung: u.user.id, sua_luc: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  if ((data as HoSo).ngay_sinh) datCoHoSo(true);
  datHoSoChung(data as HoSo);
  return data as HoSo;
}

/**
 * Xoá sạch dữ liệu của người đang đăng nhập.
 *
 * Phải xoá đích danh cả ba bảng. Hai bảng kia tham chiếu auth.users chứ không phải
 * ho_so, nên xoá mỗi dòng hồ sơ là chúng vẫn nằm lại. App không xoá được tài khoản
 * vì việc đó cần khoá quản trị, thứ không bao giờ để trong app.
 */
export async function xoaSachDuLieu() {
  if (XEM_THU) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const toi = u.user.id;

  for (const bang of ['su_kien', 'lan_rut', 'thiet_bi', 'ho_so'] as const) {
    const { error } = await supabase.from(bang).delete().eq('nguoi_dung', toi);
    if (error) throw error;
  }

  datCoHoSo(false);
  datHoSoChung(null);
  await supabase.auth.signOut();
  // Tạo ngay phiên mới. App chạy trên giả định lúc nào cũng có một người dùng
  // ẩn danh: ghi sự kiện, lá bài hôm nay và lưu hồ sơ đều cần tới nó.
  await dangNhapAnDanh();
}

export function useHoSo() {
  const [hoSo, datTaiCho] = useState<HoSo | null>(hoSoChung);
  const [dangTai, datDangTai] = useState(!daDoc);

  useEffect(() => {
    ngheHoSo.add(datTaiCho);
    docVeChung().finally(() => datDangTai(false));
    return () => {
      ngheHoSo.delete(datTaiCho);
    };
  }, []);

  const taiLai = useCallback(() => {
    datDangTai(true);
    docVeChung(true).finally(() => datDangTai(false));
  }, []);

  /** Sửa tại chỗ cho màn hình nhảy ngay, chưa đụng tới máy chủ. */
  const setHoSo = useCallback(
    (f: HoSo | null | ((h: HoSo | null) => HoSo | null)) =>
      datHoSoChung(typeof f === 'function' ? f(hoSoChung) : f),
    []
  );

  return { hoSo, dangTai, taiLai, setHoSo };
}
