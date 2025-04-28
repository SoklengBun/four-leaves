<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const lyricsList = useStorage<Lyrics[]>('lyrics-list', []);
const lyrics = ref<Lyrics>();

onMounted(() => {
  if (!lyricsList.value.length) {
    router.replace({ name: 'lyrics' });
  } else {
    const id = +router.currentRoute.value.params.id;

    const temp = lyricsList.value.find((e) => e.id === id);

    if (temp) {
      lyrics.value = temp;
    }
  }
});
</script>

<template>
  <div class="flex flex-col items-center py-5">
    <p class="text-base">{{ lyrics?.title }}</p>
    <p class="mb-5 mt-2 text-sm">{{ lyrics?.artist }}</p>

    <p class="whitespace-pre-line text-center text-xs">{{ lyrics?.romaji }}</p>
  </div>
</template>
