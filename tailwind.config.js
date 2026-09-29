/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        nen: '#1A1625',        // nền tối, màu chủ đạo
        'nen-nhat': '#241F33',
        vang: '#C9A227',       // màu nhấn
        'chu-chinh': '#F5F3F7',
        'chu-phu': '#A39CB5',
      },
    },
  },
  plugins: [],
};
