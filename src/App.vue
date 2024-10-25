<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onBeforeMount, onMounted } from 'vue';
import Layout from './components/layout/Layout.vue';
import ReloadPrompt from './components/pwa/ReloadPrompt.vue';

const route = useRoute();

onMounted(() => {
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  function ctrlShiftKey(e: KeyboardEvent, keyCode: string) {
    return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
  }

  document.onkeydown = (e: KeyboardEvent) => {
    // Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
    if (
      e.key === 'F12' ||
      ctrlShiftKey(e, 'I') ||
      ctrlShiftKey(e, 'J') ||
      ctrlShiftKey(e, 'C') ||
      (e.ctrlKey && e.key === 'U')
    )
      return false;

    return;
  };
});
</script>

<template>
  <Layout>
    <ReloadPrompt />
    <RouterView />
  </Layout>
</template>
