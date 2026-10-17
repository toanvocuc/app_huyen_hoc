/**
 * Hàng trong khu trưng bày.
 *
 * Chỉ có HÀNG. Không có đơn, không có người mua — xem migration 0027 để biết vì
 * sao ranh giới đó quan trọng.
 *
 * Dựng theo đúng khuôn `goi.ts`: dữ liệu mẫu cho chế độ xem thử nằm ngay trong
 * file, và lệnh đọc bọc try/catch chứ không nối `.catch`, vì thứ postgrest trả
 * về không phải lời hứa thật.
 */

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';
import type { BacGia } from '@/lib/gian-hang';

export type SanPham = {
  ma: string;
  ten: string;
  mo_ta: string | null;
  /** Mỗi dòng một thông số, ngăn bằng ký tự xuống dòng. */
  thong_so: string | null;
  gia: number;
  don_vi: string;
  bac_gia: BacGia[] | null;
  /** Tên tệp trong kho ảnh, không phải địa chỉ đầy đủ. */
  anh: string | null;
  con_hang: boolean;
  noi_bat: boolean;
  thu_tu: number;
};

const GOC = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

/**
 * Địa chỉ ảnh đầy đủ.
 *
 * Lưu tên tệp chứ không lưu cả địa chỉ dưới máy chủ: đổi dự án Supabase hay đổi
 * tên kho ảnh thì chỉ sửa đúng một dòng ở đây, không phải chạy lệnh cập nhật
 * từng dòng hàng.
 */
export function anhSanPham(ten: string | null | undefined): string | null {
  if (!ten) return null;
  if (ten.startsWith('http')) return ten;
  return `${GOC}/storage/v1/object/public/anh-san-pham/${ten}`;
}

/** Tám món thật của cửa hàng, chép đúng dữ liệu trên máy chủ. Dùng cho xem thử. */
const MAU: SanPham[] = [
  {
    ma: 'vong-lam-ngoc-jade-10ly',
    ten: 'Vòng Lam Ngọc Jade type A',
    mo_ta: 'Vòng tay đá lam ngọc jade loại A, hạt tròn đều, sắc xanh lam pha lục nhẹ.',
    thong_so: 'Loại: Jade type A\nKích thước hạt: 10 ly',
    gia: 280000,
    don_vi: 'vòng',
    bac_gia: [{ tu: 10, gia: 249000 }],
    anh: 'vong-lam-ngoc-jade-10ly.jpg',
    con_hang: true,
    noi_bat: true,
    thu_tu: 10,
  },
  {
    ma: 'vong-hoa-sen-thach-anh-toc-do',
    ten: 'Vòng hoa sen thạch anh tóc đỏ',
    mo_ta: 'Vòng dây đỏ kết hạt thạch anh tóc đỏ chạm hình hoa sen, kèm chi tiết đồng.',
    thong_so: 'Chất liệu: Thạch anh tóc đỏ\nKiểu: Dây đỏ, chạm hoa sen',
    gia: 230000,
    don_vi: 'vòng',
    bac_gia: null,
    anh: 'vong-hoa-sen-thach-anh-toc-do.jpg',
    con_hang: true,
    noi_bat: true,
    thu_tu: 20,
  },
  {
    ma: 'bat-tu-bao-ngoc-hoang-long-phat-tai',
    ten: 'Bát tụ bảo Ngọc Hoàng Long chữ Phát Tài',
    mo_ta: 'Bát tụ bảo bằng đá ngọc hoàng long, khắc chữ Phát Tài màu đỏ, kèm đế gỗ.',
    thong_so: 'Kích thước: 10 cm\nChất liệu: Đá ngọc hoàng long',
    gia: 360000,
    don_vi: 'bộ',
    bac_gia: [{ tu: 5, gia: 320000 }],
    anh: 'bat-tu-bao-ngoc-hoang-long-phat-tai.jpg',
    con_hang: true,
    noi_bat: true,
    thu_tu: 30,
  },
  {
    ma: 'tuong-di-lac-da-luu-ly',
    ten: 'Tượng Di Lặc đứng đá lưu ly',
    mo_ta: 'Tượng Di Lặc đứng nâng thỏi vàng, đá lưu ly màu hổ phách trong.',
    thong_so: 'Kích thước: Cao 12 cm, ngang 7 cm\nChất liệu: Đá lưu ly',
    gia: 860000,
    don_vi: 'tượng',
    bac_gia: null,
    anh: 'tuong-di-lac-da-luu-ly.jpg',
    con_hang: true,
    noi_bat: false,
    thu_tu: 40,
  },
  {
    ma: 'chuoi-bach-ngoc-cam-thach-hoa-mai',
    ten: 'Chuỗi bạch ngọc cẩm thạch A charm hoa mai',
    mo_ta:
      'Chuỗi bạch ngọc cẩm thạch loại A nếp hoá mi, charm hoa mai bạch ngọc, hồ lô băng lục bạc S925 và bi băng lục.',
    thong_so: 'Loại: Cẩm thạch A, nếp hoá mi\nKích thước hạt: 4 ly\nPhụ kiện: Bạc S925',
    gia: 2020000,
    don_vi: 'chuỗi',
    bac_gia: null,
    anh: 'chuoi-bach-ngoc-cam-thach-hoa-mai.jpg',
    con_hang: true,
    noi_bat: false,
    thu_tu: 50,
  },
  {
    ma: 'bo-am-chen-onix-trang',
    ten: 'Bộ ấm chén Onix trắng',
    mo_ta:
      'Bộ ấm chén đá onix trắng, vẽ hoa sen và viền kim loại. Có sẵn nhiều mẫu. Kèm hộp gỗ và túi quà.',
    thong_so: 'Chất liệu: Đá onix trắng\nKèm theo: Hộp gỗ, túi quà',
    gia: 2100000,
    don_vi: 'bộ',
    bac_gia: null,
    anh: 'bo-am-chen-onix-trang.jpg',
    con_hang: true,
    noi_bat: false,
    thu_tu: 60,
  },
  {
    ma: 'bo-am-tra-da-ngoc-hoang-long',
    ten: 'Bộ ấm trà đá ngọc hoàng long chạm đào',
    mo_ta:
      'Bộ ấm trà chạm khắc từ đá ngọc hoàng long, thân bình chạm hình cây đào, kèm đĩa và ly.',
    thong_so:
      'Bình: Cao 10 cm, ngang 17 cm\nLy: Cao 3 cm, đường kính 4,5 cm\nChất liệu: Đá ngọc hoàng long',
    gia: 2600000,
    don_vi: 'bộ',
    bac_gia: null,
    anh: 'bo-am-tra-da-ngoc-hoang-long.jpg',
    con_hang: true,
    noi_bat: false,
    thu_tu: 70,
  },
  {
    ma: 'bi-cau-thach-anh-den-17cm',
    ten: 'Bi cầu thạch anh đen 17 cm',
    mo_ta: 'Bi cầu thạch anh đen nguyên khối, vân tơ trắng chạy khắp thân, kèm đế gỗ.',
    thong_so: 'Đường kính: 17 cm\nTrọng lượng: 7,28 kg\nKèm theo: Đế gỗ',
    gia: 4660000,
    don_vi: 'viên',
    bac_gia: null,
    anh: 'bi-cau-thach-anh-den-17cm.jpg',
    con_hang: true,
    noi_bat: false,
    thu_tu: 80,
  },
];

export function useSanPham() {
  const [dong, datDong] = useState<SanPham[] | null>(XEM_THU ? MAU : null);
  const [loi, datLoi] = useState<string | null>(null);

  const doc = useCallback(() => {
    if (XEM_THU) return;
    let huy = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('san_pham')
          .select('*')
          .order('thu_tu', { ascending: true });
        if (huy) return;
        // Xét `error` TRƯỚC. postgrest không ném, nó trả { data: null, error },
        // nên bỏ qua chỗ này là mạng chập biến thành "cửa hàng không có hàng".
        if (error) datLoi(error.message);
        else datDong((data as SanPham[]) ?? []);
      } catch (e) {
        if (huy) return;
        datLoi(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      huy = true;
    };
  }, []);

  useEffect(doc, [doc]);

  return { dong, loi, dangTai: dong === null && loi === null };
}

/** Tìm một món theo mã, trong danh sách đã đọc về. */
export function timSanPham(ds: SanPham[] | null, ma: string | null | undefined): SanPham | null {
  if (!ds || !ma) return null;
  return ds.find((s) => s.ma === ma) ?? null;
}
