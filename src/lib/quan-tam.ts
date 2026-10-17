/**
 * Danh sách quan tâm — mấy món khách gom lại để hỏi cửa hàng một lượt.
 *
 * ─────────────────────────────────────────────────── NẰM TRÊN MÁY, KHÔNG GỬI ĐI
 *
 * Danh sách này KHÔNG bao giờ rời khỏi máy khách. Không có bảng nào dưới máy chủ
 * giữ nó, không ai ngoài khách đọc được, và app cũng không hỏi tên hay số điện
 * thoại của ai. Khách bấm gửi thì app chép danh sách ra chữ, khách tự dán vào
 * Zalo và gửi bằng tài khoản của mình.
 *
 * Đó không phải chi tiết kỹ thuật mà là ranh giới đã chọn, xem migration 0027.
 *
 * ──────────────────────────────────────────── VÌ SAO ĐĂNG KÝ `khiDoiTaiKhoan`
 *
 * Đây là ô nhớ ở cấp module, đúng loại đã gây ra con bug "đăng nhập tài khoản
 * khác vẫn ra đồ của người cũ". Biến cấp module sống qua cả lần đăng xuất, nên
 * không dọn thì người sau mở app ra thấy danh sách người trước gom. Đăng ký dọn
 * ngay từ dòng đầu, không đợi tới lúc nhớ ra.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { khiDoiTaiKhoan } from '@/lib/doi-tai-khoan';

export type MonQuanTam = { ma: string; soLuong: number };

const KHOA = 'omora-quan-tam';
/** Nhiều hơn mức này thì tin nhắn dài quá, Zalo dán vào nhìn rối. */
export const TOI_DA_MON = 20;
const TOI_DA_SO_LUONG = 99;

let ds: MonQuanTam[] = [];
let daNap = false;
const nghe = new Set<(d: MonQuanTam[]) => void>();

function bao() {
  // Đưa bản sao ra ngoài: React so sánh theo danh tính, trả thẳng mảng gốc thì
  // sửa tại chỗ xong màn hình không vẽ lại.
  const ban = [...ds];
  nghe.forEach((f) => f(ban));
}

function luu() {
  AsyncStorage.setItem(KHOA, JSON.stringify(ds)).catch(() => {
    // Không ghi được thì thôi, danh sách vẫn còn trong lần chạy này.
  });
}

function hopLe(x: unknown): x is MonQuanTam {
  if (!x || typeof x !== 'object') return false;
  const m = x as Record<string, unknown>;
  return typeof m.ma === 'string' && m.ma.length > 0 && typeof m.soLuong === 'number' && m.soLuong > 0;
}

async function nap() {
  if (daNap) return;
  daNap = true;
  try {
    const chu = await AsyncStorage.getItem(KHOA);
    if (!chu) return;
    const doc = JSON.parse(chu);
    // Lọc lại từng dòng chứ không tin thẳng thứ đọc lên: bản cũ của app có thể
    // đã ghi xuống một hình dạng khác, mà một dòng méo là cả màn hình vỡ.
    if (Array.isArray(doc)) {
      ds = doc.filter(hopLe);
      bao();
    }
  } catch {
    // Hỏng thì coi như danh sách trống.
  }
}

export function themQuanTam(ma: string, soLuong = 1) {
  const co = ds.find((m) => m.ma === ma);
  if (co) co.soLuong = Math.min(TOI_DA_SO_LUONG, co.soLuong + soLuong);
  else if (ds.length < TOI_DA_MON) ds = [...ds, { ma, soLuong: Math.max(1, soLuong) }];
  else return false;
  luu();
  bao();
  return true;
}

export function datSoLuong(ma: string, soLuong: number) {
  if (soLuong <= 0) return boQuanTam(ma);
  ds = ds.map((m) => (m.ma === ma ? { ...m, soLuong: Math.min(TOI_DA_SO_LUONG, soLuong) } : m));
  luu();
  bao();
}

export function boQuanTam(ma: string) {
  ds = ds.filter((m) => m.ma !== ma);
  luu();
  bao();
}

export function xoaHetQuanTam() {
  ds = [];
  luu();
  bao();
}

export function dangQuanTam(ma: string): boolean {
  return ds.some((m) => m.ma === ma);
}

export function useQuanTam() {
  const [dong, datDong] = useState<MonQuanTam[]>(() => [...ds]);

  useEffect(() => {
    nghe.add(datDong);
    void nap();
    return () => {
      nghe.delete(datDong);
    };
  }, []);

  return dong;
}

// Máy đổi sang người khác thì danh sách của người cũ không còn là của ai cả.
khiDoiTaiKhoan(() => {
  ds = [];
  daNap = true;
  AsyncStorage.removeItem(KHOA).catch(() => {});
  bao();
});
