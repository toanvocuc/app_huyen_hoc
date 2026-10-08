/** @type {import('tailwindcss').Config} */
module.exports = {
  // App chỉ có một bộ màu, nền xanh đêm, không đổi theo sáng tối của máy. Để
  // mặc định 'media' thì bản web chết ngay lúc dựng: NativeWind ném lỗi
  // "Cannot manually set color scheme". Không chỗ nào dùng biến thể dark: nên
  // đổi sang 'class' không làm đổi giao diện.
  darkMode: 'class',
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Giữ khớp với src/constants/giao-dien.ts
        nen: '#0B1220',
        'nen-nhat': '#141E33',
        'nen-nhat-hon': '#1B2740',
        vang: '#D4A84B',
        'vang-sang': '#E8C673',
        'chu-chinh': '#EDF1F8',
        'chu-phu': '#9AA8C0',
        'chu-mo': '#63708A',
        vien: '#233149',
        tot: '#4FBF95',
        canh: '#E08268',
      },
    },
  },
  plugins: [],
};
