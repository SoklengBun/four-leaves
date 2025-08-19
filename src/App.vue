<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
import Layout from './components/layout/Layout.vue';
import ReloadPrompt from './components/pwa/ReloadPrompt.vue';
import { disableContextMenu, disableDevToolWithKeyboard } from './utils/lock';

const route = useRoute();

const setAppHeight = () => {
  const doc = document.getElementsByTagName('html')?.[0];

  if (!doc) return;

  doc.style.setProperty('--body-height', `${window.innerHeight}px`);
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
  </Layout>
</template>
