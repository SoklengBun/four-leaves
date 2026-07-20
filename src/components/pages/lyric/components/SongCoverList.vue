<script setup lang="ts">
import { onClickOutside, useMediaQuery } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import CustomPopup from '~/components/shares/CustomPopup.vue';
import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';
import MarqueeText from '~/components/shares/MarqueeText.vue';

import { usePlayer } from '~/stores/player';
import { usePlaylist } from '~/stores/playlist';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import Loading from '~/components/shares/Loading.vue';

const player = usePlayer();
const playlist = usePlaylist();
const { current, videoId } = storeToRefs(player);

const isMobile = useMediaQuery('(max-width: 767px)');
const isOpen = ref(false);
const savingDefaultId = ref('');
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
  if (!playlist.list || !current.value) return null;
  return playlist.list.items.find((item) => item.id === current.value?.id || item.videoId === current.value?.videoId) ?? null;
});
const canSetDefaultCover = computed(() => !!playlist.list && playlist.list.id !== 0 && !!currentPlaylistItem.value?.playlistItemId);
const defaultCoverId = computed(() => currentPlaylistItem.value?.defaultCoverId || currentPlaylistItem.value?.videoId || '');

const selectVersion = (id: string) => {
  if (!current.value) return;
  player.selectSong(current.value, id);
  isOpen.value = false;
};

const isDefaultCover = (coverId: string) => canSetDefaultCover.value && defaultCoverId.value === coverId;
const isSavingDefault = (coverId: string) => savingDefaultId.value === coverId;

const setDefaultCover = async (coverId: string) => {
  if (!canSetDefaultCover.value || !playlist.list || !currentPlaylistItem.value?.playlistItemId) return;
  if (defaultCoverId.value === coverId) return;
  if (!current.value?.playlistItemId) return;
  const currentSong = current.value;
  savingDefaultId.value = coverId;
  try {
    await playlist.updateItem(current.value.playlistItemId, { defaultCoverId: coverId });
    await player.selectSong(currentSong, coverId);
  } finally {
    savingDefaultId.value = '';
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
      class="absolute right-1.5 top-1.5 z-20 flex items-center gap-1 rounded-full bg-overlay px-2 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm transition-opacity hover:bg-surface-hover dark:text-primary"
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
      class="box-cover absolute -top-2 left-[calc(100%+0.5rem)] z-30 mt-2 flex max-h-[70vh] w-[280px] flex-col overflow-hidden rounded-xl bg-card"
    >
      <p class="border-b border-border px-3 py-2 text-xs font-semibold text-primary">Versions ({{ versions.length }})</p>
      <ul class="min-h-0 flex-1 overflow-y-auto">
        <template v-for="(item, i) in versions" :key="i">
          <li class="group relative flex shrink-0 items-center px-3 py-3">
            <button type="button" class="relative z-10 flex min-w-0 flex-1 items-center text-left" @click="selectVersion(item.id)">
              <div class="size-10 shrink-0 overflow-hidden rounded-lg md:size-12">
                <YoutubeThumbnail :id="item.id" />
              </div>
              <div class="min-w-0 flex-1 px-2">
                <MarqueeText :text="displayTitle" class="w-full min-w-0 text-xs font-semibold text-foreground md:text-sm" :gap="24" :speed="32" />
                <MarqueeText
                  :text="getLyricsArtistsLabel(item.artists)"
                  class="w-full min-w-0 text-[11px] text-foreground-muted md:text-xs"
                  :gap="20"
                  :speed="30"
                />
              </div>
            </button>
            <template v-if="canSetDefaultCover">
              <Loading class="relative z-10 shrink-0 text-base" :class="{ 'opacity-0': !isSavingDefault(item.id) }" />
              <button
                type="button"
                class="relative z-10 ml-2 shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold text-foreground-muted transition-[background-color,border-color,color,transform] hover:border-primary hover:bg-primary-soft hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                :class="isDefaultCover(item.id) ? 'border-border-strong bg-primary-soft text-primary' : 'border-border bg-surface'"
                :disabled="!!savingDefaultId || isDefaultCover(item.id)"
                @click.stop="setDefaultCover(item.id)"
              >
                {{ isDefaultCover(item.id) ? 'Default' : 'Set default' }}
              </button>
            </template>
            <div
              class="song-cover-highlight pointer-events-none absolute inset-0 hidden group-hover:!block group-active:!block"
              :class="{ '!block': item.id === videoId }"
            ></div>
          </li>
          <li aria-hidden="true" class="song-cover-divider h-px w-full shrink-0 bg-border last:hidden"></li>
        </template>
      </ul>
    </div>

    <!-- Mobile van-popup bottom sheet -->
    <CustomPopup
      v-if="isMobile"
      v-model:show="isOpen"
      mobile-position="bottom"
      eyebrow="Versions"
      :title="displayTitle"
      :description="`${versions.length} version${versions.length === 1 ? '' : 's'} available for this song.`"
      @close="closePanel"
    >
      <div class="flex h-full max-h-[70vh] flex-col">
        <ul class="min-h-0 flex-1 overflow-y-auto">
          <template v-for="(item, i) in versions" :key="i">
            <li class="group relative flex shrink-0 items-center px-1 py-3">
              <button type="button" class="relative z-10 flex min-w-0 flex-1 items-center text-left" @click="selectVersion(item.id)">
                <div class="size-10 shrink-0 overflow-hidden rounded-lg md:size-12">
                  <YoutubeThumbnail :id="item.id" />
                </div>
                <div class="min-w-0 flex-1 px-2">
                  <MarqueeText :text="displayTitle" class="w-full min-w-0 text-sm font-semibold text-foreground" :gap="24" :speed="32" />
                  <MarqueeText
                    :text="getLyricsArtistsLabel(item.artists)"
                    class="w-full min-w-0 text-xs text-foreground-muted"
                    :gap="20"
                    :speed="30"
                  />
                </div>
              </button>
              <template v-if="canSetDefaultCover">
                <Loading class="relative z-10 shrink-0 text-base" :class="{ 'opacity-0': !isSavingDefault(item.id) }" />
                <button
                  type="button"
                  class="relative z-10 ml-2 shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold text-foreground-muted transition-[background-color,border-color,color,transform] hover:border-primary hover:bg-primary-soft hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  :class="isDefaultCover(item.id) ? 'border-border-strong bg-primary-soft text-primary' : 'border-border bg-surface'"
                  :disabled="!!savingDefaultId || isDefaultCover(item.id)"
                  @click.stop="setDefaultCover(item.id)"
                >
                  {{ isDefaultCover(item.id) ? 'Default' : 'Set default' }}
                </button>
              </template>
              <div
                class="song-cover-highlight pointer-events-none absolute inset-0 hidden group-hover:!block group-active:!block"
                :class="{ '!block': item.id === videoId }"
              ></div>
            </li>
            <li aria-hidden="true" class="song-cover-divider h-px w-full shrink-0 bg-border last:hidden"></li>
          </template>
        </ul>
      </div>
    </CustomPopup>
  </div>
</template>
<style scoped>
.song-cover-divider {
  box-shadow: 0px 0px 3px #31018c74;
}

.dark .song-cover-divider {
  box-shadow: 0px 0px 3px #0f3e71;
}

.song-cover-highlight {
  background: linear-gradient(150deg, transparent 0%, transparent 10%, #b994ff33 50%, transparent 90%, transparent 100%);
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: highlight 1s ease-in-out infinite;
}

@keyframes highlight {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -100% 0;
  }
}
</style>
