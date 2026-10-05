/** Bộ màu, phông chữ và khoảng cách dùng chung. Đổi ở đây là đổi cả app. */

export const MAU = {
  // Nền xanh đêm, đi từ đậm dưới lên nhạt trên.
  nen: '#0B1220',
  nenGiua: '#0E1728',
  nenTren: '#131E33',
  nenNhat: '#141E33',
  nenNhatHon: '#1B2740',

  vang: '#D4A84B',
  vangSang: '#E8C673',
  vangMo: 'rgba(212,168,75,0.30)',
  vangRatMo: 'rgba(212,168,75,0.10)',

  chuChinh: '#EDF1F8',
  chuPhu: '#9AA8C0',
  chuMo: '#63708A',
  vien: '#233149',
  tot: '#4FBF95',
  canh: '#E08268',
} as const;

/** Nền chuyển sắc cho toàn màn hình. */
export const NEN_CHUYEN: readonly [string, string, string] = [MAU.nenTren, MAU.nenGiua, MAU.nen];

/** Nền chuyển sắc cho khối nội dung, nhạt hơn nền một chút. */
export const KHOI_CHUYEN: readonly [string, string] = ['#18233A', '#111A2C'];

export const CHU = {
  /** Phông có chân, dùng cho tiêu đề và tên lá bài. Chỉ dùng ở cỡ lớn. */
  hoa: 'CormorantGaramond_600SemiBold',
  hoaDam: 'CormorantGaramond_700Bold',
  /** Phông thân, vẽ riêng cho tiếng Việt nên dấu không bị bẹp. */
  than: 'BeVietnamPro_400Regular',
  thanVua: 'BeVietnamPro_500Medium',
  thanDam: 'BeVietnamPro_600SemiBold',
} as const;

/** Tỷ lệ lá bài Rider-Waite thật: 57mm x 100mm. */
export const TY_LE_LA_BAI = 57 / 100;

/**
 * Chiều cao thanh tab dưới, chưa kể lề của thanh điều hướng máy.
 * Màn hình nằm trong tab phải chừa đệm dưới ít nhất bằng số này cộng lề,
 * không thì nội dung cuối trang chui xuống dưới thanh tab.
 */
export const CAO_THANH_TAB = 62;
