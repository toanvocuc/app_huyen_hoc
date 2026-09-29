/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Giữ khớp với src/constants/giao-dien.ts
        nen: '#0A0813',
        'nen-nhat': '#171327',
        'nen-nhat-hon': '#1F1933',
        vang: '#C9A227',
        'vang-sang': '#E8C55A',
        'chu-chinh': '#F2EFF7',
        'chu-phu': '#A9A0BE',
        'chu-mo': '#6E6688',
        vien: '#332B4A',
        tot: '#5DBD92',
        canh: '#E0806A',
      },
    },
  },
  plugins: [],
};
