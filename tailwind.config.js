/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        dark: '#181818',
      },
      zIndex: {
        55: '55',
        100: '100',
      },
    },
  },
  plugins: [],
};
