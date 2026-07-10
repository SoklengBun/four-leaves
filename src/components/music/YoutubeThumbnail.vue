<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import defaultImage from '~/assets/images/Priconne_Kokkoro_hurt.png';

const props = defineProps<{
  id: string;
}>();

type ThumbnailQuality = 'maxresdefault' | 'mqdefault';

const containerRef = ref<HTMLDivElement | null>(null);
const src = ref<string | null>(null);
const quality = ref<ThumbnailQuality>('maxresdefault');
const hasStartedLoading = ref(false);

let observer: IntersectionObserver | null = null;
let loadToken = 0;
let loadTimer: number | null = null;
let idleHandle: number | null = null;

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
  quality.value = 'maxresdefault';
  src.value = null;
};

const loadThumbnail = (videoId: string, token: number) => {
  if (token !== loadToken) return;

  // The service worker caches this URL for offline use in the installed PWA.
  src.value = buildThumbnailUrl(videoId, quality.value);
};

const onThumbnailError = () => {
  if (quality.value === 'maxresdefault' && props.id) {
    quality.value = 'mqdefault';
    src.value = buildThumbnailUrl(props.id, quality.value);
    return;
  }

  src.value = defaultImage;
};

const startThumbnailLoad = () => {
  if (hasStartedLoading.value || !props.id) return;

  hasStartedLoading.value = true;
  const token = ++loadToken;
  const run = () => {
    idleHandle = null;
    loadTimer = null;
    loadThumbnail(props.id, token);
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

const onThumbnailLoad = (e: Event) => {
  console.log(`Thumbnail loaded: event`, e);
  const img = e.target as HTMLImageElement;
  if (!img) return;

  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  console.log(`Thumbnail loaded: ${naturalWidth}x${naturalHeight}`);

  if (naturalWidth === 120 && naturalHeight === 90) {
    onThumbnailError();
  }
};
</script>

<template>
  <div ref="containerRef" class="relative size-full bg-[#f8dbe9]">
    <Transition name="thumbnail-fade" appear>
      <img
        v-if="src"
        :src="src"
        class="size-full object-cover"
        alt="Video thumbnail"
        loading="lazy"
        decoding="async"
        @error="onThumbnailError"
        @load="onThumbnailLoad"
      />
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
