<script setup lang="ts">
import { onClickOutside, useMediaQuery } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';
import { updatePlaylistItem } from '~/services/playlist';
import { usePlayer } from '~/stores/player';
import { usePlaylistStore } from '~/stores/usePlaylistStore';
import { useHomeStorage } from '~/utils/home-storage';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import showToast from '~/utils/toast';

const player = usePlayer();
const playlistStore = usePlaylistStore();
const homeStorage = useHomeStorage();
const { current, videoId, playlist } = storeToRefs(player);

const isMobile = useMediaQuery('(max-width: 767px)');
const isOpen = ref(false);
const isSavingDefault = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

const versions = computed(() => {
  if (!current.value) return [];

  const defaultVersion: { id: string; artists: LyricsArtist[] } = {
    id: current.value?.videoId || '',
    artists: current.value?.artists || [],
  };
  const covers = (current.value.covers ?? []) as { id: string; artists: LyricsArtist[] }[];
  return [defaultVersion, ...covers];
});

const hasVersions = computed(() => versions.value.length > 1);
const displayTitle = computed(() => getLyricsTitleLabel(current.value));
const currentPlaylistItem = computed(() => {
  if (!playlist.value || !current.value) return null;
  return playlist.value.items.find((item) => item.id === current.value?.id || item.videoId === current.value?.videoId) ?? null;
});
const canSetDefaultCover = computed(() => !!playlist.value && playlist.value.id !== 0 && !!currentPlaylistItem.value?.playlistItemId);
const defaultCoverId = computed(() => currentPlaylistItem.value?.defaultCoverId || currentPlaylistItem.value?.videoId || '');

const selectVersion = (id: string) => {
  if (!current.value) return;
  player.selectSong(current.value, id);
  isOpen.value = false;
};

const isDefaultCover = (coverId: string) => canSetDefaultCover.value && defaultCoverId.value === coverId;

const setDefaultCover = async (coverId: string) => {
  if (!canSetDefaultCover.value || !playlist.value || !currentPlaylistItem.value?.playlistItemId) return;
  if (defaultCoverId.value === coverId) return;

  isSavingDefault.value = true;
  try {
    const { data } = await updatePlaylistItem(currentPlaylistItem.value.playlistItemId, { defaultCoverId: coverId });
    if (data.value?.code !== 0) {
      showToast({ message: data.value?.message || 'Failed to update default cover', type: 'error' });
      return;
    }

    const nextItems = playlist.value.items.map((item) =>
      item.playlistItemId === currentPlaylistItem.value?.playlistItemId ? { ...item, defaultCoverId: coverId } : item,
    );
    const nextPlaylist = {
      ...playlist.value,
      items: nextItems,
    };
    playlist.value = nextPlaylist;
    playlistStore.replacePlaylist(nextPlaylist);

    if ((homeStorage.value.playlists ?? []).some((item) => item.id === nextPlaylist.id)) {
      homeStorage.value = {
        ...homeStorage.value,
        playlists: (homeStorage.value.playlists ?? []).map((item) => (item.id === nextPlaylist.id ? nextPlaylist : item)),
      };
    }

    showToast({ message: 'Default cover updated', type: 'success' });
  } catch {
    showToast({ message: 'Network error while updating default cover', type: 'error' });
  } finally {
    isSavingDefault.value = false;
  }
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
      class="box-cover absolute -top-2 left-[calc(100%+0.5rem)] z-30 mt-2 flex max-h-[70vh] w-[280px] flex-col overflow-hidden rounded-xl bg-white"
    >
      <p class="border-b border-[#fff0f8] px-3 py-2 text-xs font-semibold text-[#ff4f9b]">Versions ({{ versions.length }})</p>
      <ul class="min-h-0 flex-1 overflow-y-auto">
        <li
          v-for="(item, i) in versions"
          :key="i"
          class="flex items-center gap-2.5 px-3 py-2 transition-colors"
          :class="{ 'bg-[#fff0f8]': item.id === videoId }"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left transition-colors hover:bg-[#fff4fb]"
            @click="selectVersion(item.id)"
          >
            <div class="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <YoutubeThumbnail :id="item.id" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-semibold text-[#1f1f1f]">{{ displayTitle }}</p>
              <p class="truncate text-[11px] text-[#6b7280]">{{ getLyricsArtistsLabel(item.artists) }}</p>
            </div>
            <svg v-if="item.id === videoId" class="size-3.5 shrink-0 text-[#ff4f9b]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
          <button
            v-if="canSetDefaultCover"
            type="button"
            class="ml-2 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :class="isDefaultCover(item.id) ? 'bg-[#ffd5e7] text-[#b93876]' : 'bg-[#fff4fb] text-[#d14d8a]'"
            :disabled="isSavingDefault || isDefaultCover(item.id)"
            @click.stop="setDefaultCover(item.id)"
          >
            {{ isDefaultCover(item.id) ? 'Default' : 'Set default' }}
          </button>
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
        {{ playlist?.id }}
        <div class="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#ffc5e4]"></div>
        <p class="mb-3 text-sm font-semibold text-[#ff4f9b]">Covers ({{ versions.length }})</p>
        <ul class="min-h-0 flex-1 space-y-2 overflow-y-auto">
          <li
            v-for="(item, i) in versions"
            :key="i"
            class="flex items-center gap-3 rounded-xl p-2 transition-colors"
            :class="{ 'bg-[#fff0f8]': item.id === videoId }"
          >
            <button
              type="button"
              class="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition-colors active:bg-[#fff0f8]"
              @click="selectVersion(item.id)"
            >
              <div class="relative size-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <YoutubeThumbnail :id="item.id" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-[#1f1f1f]">{{ displayTitle }}</p>
                <p class="truncate text-xs text-[#6b7280]">{{ getLyricsArtistsLabel(item.artists) }}</p>
              </div>
              <svg v-if="item.id === videoId" class="size-4 shrink-0 text-[#ff4f9b]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </button>
            <button
              v-if="canSetDefaultCover"
              type="button"
              class="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              :class="isDefaultCover(item.id) ? 'bg-[#ffd5e7] text-[#b93876]' : 'bg-[#fff4fb] text-[#d14d8a]'"
              :disabled="isSavingDefault || isDefaultCover(item.id)"
              @click.stop="setDefaultCover(item.id)"
            >
              {{ isDefaultCover(item.id) ? 'Default' : 'Set default' }}
            </button>
          </li>
        </ul>
      </div>
    </van-popup>
  </div>
</template>
