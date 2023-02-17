import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: 'localhost',
    port: 5555,
    open: true,
    https: false,
    proxy: {},
  },
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@/': `${path.resolve(__dirname, 'src')}/`,
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
    },
  },
});
