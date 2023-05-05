<script setup lang="ts">
import FooterBar from './components/FooterBar.vue';
import NavBar from './components/header/NavBar.vue';
import { useRoute } from 'vue-router';
import { onMounted, watch } from 'vue';

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
  <div class="body flex min-h-screen w-full flex-col">
    <NavBar />
    <main>
      <RouterView />
    </main>
    <!-- <FooterBar v-if="route.name !== 'home'" /> -->
  </div>
</template>

<style>
body {
  height: 100vh;
}
</style>
