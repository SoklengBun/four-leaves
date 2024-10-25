import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import vueJsxPlugin from '@vitejs/plugin-vue-jsx';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: 'localhost',
    port: 5555,
    open: true,
    proxy: {},
  },
  plugins: [
    vue(),
    vueJsxPlugin(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Anella',
        short_name: 'Anella',
        description: 'Anella',
        theme_color: '#ffffff',
        icons: [
          {
            src: '192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '1024x1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{css,js,html}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@/': `${path.resolve(__dirname, 'src')}/`,
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern', // or "modern", "legacy"
        quietDeps: true,
      },
      sass: {
        api: 'modern', // or "modern", "legacy"
        quietDeps: true,
      },
    },
  },
});
