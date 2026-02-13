<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import CloudNavBar from '~/components/layout/header/lyric/CloudNavBar.vue';
import { pxToRem } from '~/utils/helper';

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
  <div class="h-[calc(var(--body-height))] overflow-hidden bg-blue-100 dark:bg-[#0c102f]" :style="{ '--nav-height': pxToRem(60) }">
    <CloudNavBar />
    <RouterView />
  </div>
</template>
