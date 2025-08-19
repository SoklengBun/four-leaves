<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import CloudNavBar from '~/components/layout/header/lyric/CloudNavBar.vue';

onMounted(() => {
  const html = document.getElementById('anella-container');

  if (!html) return;
  html.style.overflow = 'hidden';
});

onUnmounted(() => {
  const html = document.getElementById('anella-container');

  if (!html) return;
  html.style.overflow = '';
});
</script>

<template>
  <div
    class="h-[calc(var(--body-height))] overflow-hidden"
    style="--nav-height: 60px"
  >
    <CloudNavBar />
    <RouterView />
  </div>
</template>
