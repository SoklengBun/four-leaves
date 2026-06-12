<script setup lang="ts">
import { onClickOutside, useMediaQuery } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { usePlayer } from '~/stores/player';

const player = usePlayer();
const { current, src } = storeToRefs(player);

const isMobile = useMediaQuery('(max-width: 767px)');
const isOpen = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

const versions = computed(() => {
  if (!Array.isArray(current.value?.url)) return [];
  return current.value.url as { a: string; l: string }[];
});

const hasVersions = computed(() => versions.value.length > 1);

const extractVideoId = (value: string) => {
  if (!value) return '';
  const v = value.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  try {
    const url = new URL(v);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    if (url.hostname.includes('youtube.com')) {
      const byQuery = url.searchParams.get('v');
      if (byQuery) return byQuery;
      const parts = url.pathname.split('/');
      const embedIdx = parts.findIndex((p) => p === 'embed');
      if (embedIdx >= 0) return parts[embedIdx + 1] || '';
    }
  } catch {
    return '';
  }
  return '';
};

const thumbnailUrl = (videoUrl: string) => {
  const id = extractVideoId(videoUrl);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
};

const isActive = (videoUrl: string) => extractVideoId(videoUrl) === extractVideoId(src.value);

const selectVersion = (item: { a: string; l: string }) => {
  player.switchVersion(item.l);
  isOpen.value = false;
};

const togglePanel = () => {
  isOpen.value = !isOpen.value;
};

const closePanel = () => {
  isOpen.value = false;
};

onClickOutside(
  panelRef,
  () => {
    if (isMobile.value || !isOpen.value) return;
    closePanel();
  },
  { ignore: [triggerRef] },
);
</script>

<template>
  <div v-if="hasVersions">
    <button
      ref="triggerRef"
      type="button"
      class="absolute right-1.5 top-1.5 z-20 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
      aria-label="Show song versions"
      @click="togglePanel"
    >
      <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
      {{ versions.length }}
    </button>

    <!-- Desktop popover -->
    <div
      v-if="isOpen && !isMobile"
      ref="panelRef"
      class="absolute left-0 top-full z-30 mt-2 flex max-h-[70vh] w-[280px] flex-col overflow-hidden rounded-xl border border-[#ffd5eb] bg-white shadow-[0_8px_24px_#ff8bc44d]"
    >
      <p class="border-b border-[#fff0f8] px-3 py-2 text-xs font-semibold text-[#ff4f9b]">Versions ({{ versions.length }})</p>
      <ul class="min-h-0 flex-1 overflow-y-auto">
        <li
          v-for="(item, i) in versions"
          :key="i"
          class="flex cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors hover:bg-[#fff4fb]"
          :class="{ 'bg-[#fff0f8]': isActive(item.l) }"
          @click="selectVersion(item)"
        >
          <div class="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img :src="thumbnailUrl(item.l)" class="size-full object-cover" alt="" />
            <div v-if="isActive(item.l)" class="absolute inset-0 flex items-center justify-center rounded-lg bg-[#ff4f9b55]">
              <svg class="size-4 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-semibold text-[#1f1f1f]">{{ current?.title }}</p>
            <p class="truncate text-[11px] text-[#6b7280]">{{ item.a }}</p>
          </div>
          <svg v-if="isActive(item.l)" class="size-3.5 shrink-0 text-[#ff4f9b]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </li>
      </ul>
    </div>

    <!-- Mobile van-popup bottom sheet -->
    <van-popup
      v-if="isMobile"
      v-model:show="isOpen"
      position="bottom"
      round
      :style="{
        background: 'linear-gradient(to bottom, #fff9fd, #ffffff)',
        maxHeight: '70vh',
      }"
    >
      <div class="flex h-full max-h-[70vh] flex-col p-4">
        <div class="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#ffc5e4]"></div>
        <p class="mb-3 text-sm font-semibold text-[#ff4f9b]">Versions ({{ versions.length }})</p>
        <ul class="min-h-0 flex-1 space-y-2 overflow-y-auto">
          <li
            v-for="(item, i) in versions"
            :key="i"
            class="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors active:bg-[#fff0f8]"
            :class="{ 'bg-[#fff0f8]': isActive(item.l) }"
            @click="selectVersion(item)"
          >
            <div class="relative size-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              <img :src="thumbnailUrl(item.l)" class="size-full object-cover" alt="" />
              <div v-if="isActive(item.l)" class="absolute inset-0 flex items-center justify-center rounded-xl bg-[#ff4f9b55]">
                <svg class="size-5 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-[#1f1f1f]">{{ current?.title }}</p>
              <p class="truncate text-xs text-[#6b7280]">{{ item.a }}</p>
            </div>
            <svg v-if="isActive(item.l)" class="size-4 shrink-0 text-[#ff4f9b]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </li>
        </ul>
      </div>
    </van-popup>
  </div>
</template>
