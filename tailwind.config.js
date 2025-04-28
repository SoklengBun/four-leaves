const { DEFAULT_CIPHERS } = require('tls');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
        },
      },
      colors: {
        dark: '#181818',
        'light-pink': '#ff92c1',
      },
      zIndex: {
        55: '55',
        100: '100',
      },
      spacing: {
        nav: 'var(--nav-height)',
      },
    },
  },
  plugins: [],
};
