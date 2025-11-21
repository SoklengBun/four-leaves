<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
import Layout from './components/layout/Layout.vue';
import ReloadPrompt from './components/pwa/ReloadPrompt.vue';
import { disableContextMenu, disableDevToolWithKeyboard } from './utils/lock';
import Firework from './components/animation/Firework.vue';

const route = useRoute();

const setAppHeight = () => {
  const doc = document.getElementsByTagName('html')?.[0];

  if (!doc) return;

  setTimeout(() => {
    doc.style.setProperty('--body-height', `${window.innerHeight}px`);
  }, 1000);
};

onMounted(() => {
  setAppHeight();
  const isDev = import.meta.env.VITE_DEV;
  if (isDev) return;
  disableContextMenu();
  disableDevToolWithKeyboard();
});
</script>

<template>
  <Layout>
    <ReloadPrompt />
    <RouterView />
    <Firework />
  </Layout>
</template>
