<script setup lang="ts">
import { computed, nextTick, onActivated, onDeactivated, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import LyricsLoadingState from './components/LyricsLoadingState.vue';
import LyricsSongShelf from './components/LyricsSongShelf.vue';
import { getLyricsList, resetLyricList } from '~/services/lyrics';
import { usePlayer } from '~/stores/player';
import { usePlaylist } from '~/stores/playlist';
import Loading from '~/components/shares/Loading.vue';
import { sleep } from '~/utils/helper.js';

const router = useRouter();
const player = usePlayer();
const playlist = usePlaylist();

const containerRef = ref<HTMLDivElement | null>(null);
const scrollContainerRef = ref<HTMLElement | null>(null);
const songs = ref<Lyrics[]>([]);
const page = ref(1);
const isInitialLoading = ref(true);
const isLoadingMore = ref(false);
const isSelecting = ref(false);
const hasMore = ref(true);
const error = ref('');

const allLyricsPlaylist = computed<Playlist>(() => {
  return {
    id: 0,
    name: 'All Lyrics',
    description: 'Every song from the lyrics catalog',
    isPublic: false,
    items: songs.value,
  };
});

const loadNextPage = async () => {
  if (!hasMore.value || isLoadingMore.value) return;

  isLoadingMore.value = true;
  error.value = '';

  try {
    const items = await getLyricsList(page.value);

    if (items.length < 10) {
      hasMore.value = false;
    }

    songs.value = [...songs.value, ...items];
    page.value += 1;
  } catch {
    error.value = 'Failed to load more lyrics.';
  } finally {
    isLoadingMore.value = false;
    isInitialLoading.value = false;
    await nextTick();
    maybeLoadMore();
  }
};

const resolveScrollContainer = () => {
  let element = containerRef.value?.parentElement ?? null;

  while (element) {
    const overflowY = window.getComputedStyle(element).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return element;
    }
    element = element.parentElement;
  }

  return containerRef.value;
};

const maybeLoadMore = () => {
  const container = scrollContainerRef.value;
  if (!container || isLoadingMore.value || !hasMore.value) return;

  const remaining = container.scrollHeight - container.scrollTop - container.clientHeight;
  if (remaining < 320) {
    void loadNextPage();
  }
};

const onScroll = () => {
  maybeLoadMore();
};

const bindScrollListener = () => {
  scrollContainerRef.value?.removeEventListener('scroll', onScroll);
  scrollContainerRef.value = resolveScrollContainer();
  scrollContainerRef.value?.addEventListener('scroll', onScroll, { passive: true });
};

const onSelect = async (song: PlaylistItem) => {
  if (isSelecting.value) return;

  isSelecting.value = true;

  try {
    await Promise.allSettled([
      router.push({ name: 'lyrics-detail', params: { id: song.videoId } }),
      player.selectSong(song, undefined, allLyricsPlaylist.value),
    ]);

    void (async () => {
      const cachedLyrics = await getLyricsList(1, false, true);
      if (cachedLyrics.length <= (playlist.list?.items?.length ?? 0)) return;

      playlist.list = {
        ...allLyricsPlaylist.value,
        items: cachedLyrics,
      };
    })();
  } finally {
    isSelecting.value = false;
  }
};

const onReset = async () => {
  if (isLoadingMore.value) return;
  page.value = 1;
  hasMore.value = true;
  resetLyricList();
  songs.value = [];
  await sleep(500);
  loadNextPage();
};
onMounted(async () => {
  bindScrollListener();

  if (!songs.value.length) {
    await loadNextPage();
    return;
  }

  await nextTick();
  maybeLoadMore();
});

onActivated(async () => {
  bindScrollListener();
  await nextTick();
  maybeLoadMore();
});

onDeactivated(() => {
  scrollContainerRef.value?.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <div ref="containerRef" class="container w-full px-3 pb-6 pt-3">
    <div class="all-lyrics-shell box-cover rounded-[28px] border border-[#ffd5e7] p-5 md:p-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="max-w-2xl">
          <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#d17ea8]">Lyrics Catalog</p>
          <h1 class="mt-3 text-3xl font-semibold text-[#2b1f28] md:text-5xl">Browse every song with endless scroll.</h1>
          <p class="mt-3 text-sm leading-6 text-[#725868] md:text-base">
            Open any song to start playback with the full lyrics catalog as the active queue.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="flex-1 whitespace-nowrap rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[#8a6278] shadow-[0_14px_34px_#ffbfd63d]"
          >
            <span class="tabular-nums">{{ songs.length }}</span> loaded
          </div>

          <button
            class="flex w-[80px] items-center justify-center gap-2 rounded-full border border-primary bg-pink-200 py-2 text-[#8a6278] transition-all duration-500 active:bg-green-300"
            @click="onReset"
            :disabled="isLoadingMore"
          >
            <span> Reset</span>
            <Loading v-if="isLoadingMore" />
          </button>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <LyricsSongShelf :playlist="allLyricsPlaylist" layout="grid" :max-items="0" :enable-view-more="false" @select="onSelect" />
    </div>

    <div v-if="isInitialLoading" class="mt-8 flex justify-center">
      <LyricsLoadingState />
    </div>

    <div v-else-if="error" class="mt-6 rounded-[24px] border border-dashed border-[#ffd3e6] bg-white/70 px-6 py-8 text-center text-sm text-[#8b6f80]">
      {{ error }}
    </div>

    <div v-else-if="isLoadingMore" class="mt-8 flex justify-center">
      <LyricsLoadingState />
    </div>

    <div
      v-else-if="!hasMore && !songs.length"
      class="mt-6 rounded-[24px] border border-dashed border-[#ffd3e6] bg-white/70 px-6 py-8 text-center text-sm text-[#8b6f80]"
    >
      No lyrics found in the catalog.
    </div>

    <div
      v-else-if="!hasMore && songs.length"
      class="mt-6 rounded-[24px] border border-[#ffd7e8] bg-[#fff7fb] px-6 py-4 text-center text-sm text-[#8b6f80]"
    >
      You reached the end of the catalog.
    </div>
  </div>
</template>

<style scoped>
.all-lyrics-shell {
  background: radial-gradient(circle at top right, #ffd8e9b3, transparent 30%), linear-gradient(180deg, #fffafc 0%, #fff3f8 100%);
  box-shadow: 0 20px 45px #ffb2d22e;
}
</style>
