<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import defaultImage from '~/assets/images/Priconne_Kokkoro_hurt.png';

const props = defineProps<{
  id: string;
}>();

type ThumbnailQuality = 'maxresdefault' | 'mqdefault';

const containerRef = ref<HTMLDivElement | null>(null);
const src = ref();
const thumbnailBank = useStorage<{ [videoId: string]: string }>('thumbnail-bank', {});
const hasStartedLoading = ref(false);

let observer: IntersectionObserver | null = null;
let loadToken = 0;
let loadTimer: number | null = null;
let idleHandle: number | null = null;

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

const buildThumbnailUrl = (videoId: string, quality: ThumbnailQuality) => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

const clearScheduledLoad = () => {
  if (loadTimer !== null) {
    window.clearTimeout(loadTimer);
    loadTimer = null;
  }

  if (idleHandle !== null && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(idleHandle);
    idleHandle = null;
  }
};

const resetThumbnail = () => {
  clearScheduledLoad();
  loadToken += 1;
  hasStartedLoading.value = false;
  // src.value = defaultImage;
};

const fetchThumbnail = async (videoId: string, token: number) => {
  const cachedThumbnail = thumbnailBank.value[videoId];
  if (cachedThumbnail?.startsWith('data:')) {
    if (token === loadToken) {
      src.value = cachedThumbnail;
    }
    return;
  }

  const urls = [buildThumbnailUrl(videoId, 'maxresdefault'), buildThumbnailUrl(videoId, 'mqdefault')];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);

      if (token !== loadToken) return;

      thumbnailBank.value[videoId] = dataUrl;
      src.value = dataUrl;
      return;
    } catch {
      continue;
    }
  }

  if (token === loadToken) {
    src.value = defaultImage;
  }
};

const startThumbnailLoad = () => {
  if (hasStartedLoading.value || !props.id) return;

  hasStartedLoading.value = true;
  const token = ++loadToken;
  const run = () => {
    idleHandle = null;
    loadTimer = null;
    void fetchThumbnail(props.id, token);
  };

  loadTimer = window.setTimeout(() => {
    loadTimer = null;

    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(run, { timeout: 300 });
      return;
    }

    run();
  }, 80);
};

const observeVisibility = () => {
  observer?.disconnect();

  if (!containerRef.value || typeof IntersectionObserver === 'undefined') {
    startThumbnailLoad();
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      startThumbnailLoad();
      observer?.disconnect();
    },
    {
      rootMargin: '300px 0px',
    },
  );

  observer.observe(containerRef.value);
};

watch(
  () => props.id,
  () => {
    resetThumbnail();
    observeVisibility();
  },
  { immediate: true },
);

onMounted(() => {
  observeVisibility();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  clearScheduledLoad();
});
</script>

<template>
  <div ref="containerRef" class="relative size-full bg-[#f8dbe9]">
    <Transition name="thumbnail-fade" appear>
      <img v-if="src" :src="src" class="size-full object-cover" alt="Video thumbnail" loading="lazy" decoding="async" />
    </Transition>
  </div>
</template>

<style scoped>
.thumbnail-fade-enter-active,
.thumbnail-fade-appear-active {
  transition: opacity 0.5s ease;
}

.thumbnail-fade-enter-from,
.thumbnail-fade-appear-from {
  opacity: 0;
}
</style>
