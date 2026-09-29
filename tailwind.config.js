/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Giữ khớp với src/constants/giao-dien.ts
        nen: '#1A1625',
        'nen-nhat': '#241F33',
        'nen-nhat-hon': '#2E2740',
        vang: '#C9A227',
        'chu-chinh': '#F5F3F7',
        'chu-phu': '#A39CB5',
        'chu-mo': '#6F6785',
        vien: '#332C47',
        tot: '#5DBD92',
        canh: '#E0806A',
      },
    },
  },
  plugins: [],
};
