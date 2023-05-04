/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        dark: '#181818',
        'light-pink': '#ff92c1',
      },
      zIndex: {
        55: '55',
        100: '100',
      },
    },
  },
  plugins: [],
};
