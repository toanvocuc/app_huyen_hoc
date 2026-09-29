/** Bộ màu, phông chữ và khoảng cách dùng chung. Đổi ở đây là đổi cả app. */

export const MAU = {
  // Nền đi từ tím sẫm lên tím than, không phải một màu phẳng.
  nen: '#0A0813',
  nenGiua: '#100D1B',
  nenTren: '#171324',
  nenNhat: '#171327',
  nenNhatHon: '#1F1933',

  vang: '#C9A227',
  vangSang: '#E8C55A',
  vangMo: 'rgba(201,162,39,0.28)',
  vangRatMo: 'rgba(201,162,39,0.10)',

  chuChinh: '#F2EFF7',
  chuPhu: '#A9A0BE',
  chuMo: '#6E6688',
  vien: '#332B4A',
  tot: '#5DBD92',
  canh: '#E0806A',
} as const;

/** Nền chuyển sắc cho toàn màn hình. */
export const NEN_CHUYEN: readonly [string, string, string] = [MAU.nenTren, MAU.nenGiua, MAU.nen];

/** Nền chuyển sắc cho khối nội dung, nhạt hơn nền một chút. */
export const KHOI_CHUYEN: readonly [string, string] = ['#1C1730', '#14101F'];

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
