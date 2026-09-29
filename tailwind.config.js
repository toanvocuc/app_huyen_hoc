/** @type {import('tailwindcss').Config} */
module.exports = {
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
