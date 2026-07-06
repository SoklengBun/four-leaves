<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { ref, watch } from 'vue';
import defaultImage from '~/assets/images/Priconne_Kokkoro_hurt.png';

const props = defineProps<{
  id: string;
}>();

const src = ref(defaultImage);

const thumbnailBank = useStorage<{ [videoId: string]: string }>('thumbnail-bank', {});

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to convert blob to data URL'));
    };

    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });

const loadThumbnail = async (videoId: string) => {
  const cachedThumbnail = thumbnailBank.value[videoId];

  if (cachedThumbnail?.startsWith('data:')) {
    src.value = cachedThumbnail;
    return;
  }

  const urls = [`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`];

  for (const url of urls) {
    try {
      const res = await fetch(url);

      if (!res.ok) {
        continue;
      }

      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);

      thumbnailBank.value[videoId] = dataUrl;
      src.value = dataUrl;
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
