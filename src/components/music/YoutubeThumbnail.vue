<script setup lang="ts">
import { ref, watch } from 'vue';
import defaultImage from '~/assets/images/Priconne_Kokkoro_hurt.png';

const props = defineProps<{
  id: string;
}>();

const src = ref(defaultImage);

async function loadThumbnail(videoId: string) {
  const url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      src.value = defaultImage;
      return;
    }

    const blob = await res.blob();
    src.value = URL.createObjectURL(blob);
  } catch {
    src.value = defaultImage;
  }
}

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
