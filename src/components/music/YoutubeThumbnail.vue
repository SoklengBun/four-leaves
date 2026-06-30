<script setup lang="ts">
import { ref, watch } from 'vue';
import defaultImage from '~/assets/images/Priconne_Kokkoro_hurt.png';

const props = defineProps<{
  id: string;
}>();

const src = ref(defaultImage);

const loadThumbnail = async (videoId: string) => {
  const urls = [`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`];

  for (const url of urls) {
    try {
      const res = await fetch(url);

      if (!res.ok) {
        continue;
      }

      const blob = await res.blob();
      src.value = URL.createObjectURL(blob);
      return;
    } catch {
      continue;
    }
  }

  src.value = defaultImage;
};

watch(
  () => props.id,
  (id) => {
    if (id) {
      loadThumbnail(id);
    }
  },
  { immediate: true },
);
</script>

<template>
  <img :src="src" class="size-full object-cover" alt="Video thumbnail" />
</template>
