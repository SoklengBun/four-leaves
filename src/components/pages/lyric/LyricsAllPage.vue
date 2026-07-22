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
import RoundButton from '~/components/shares/RoundButton.vue';
import IconRefresh from '~/components/icons/IconRefresh.vue';

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
    console.error('Failed to load more lyrics.');
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
  isInitialLoading.value = true;
  resetLyricList();
  songs.value = [];
  await sleep(500);
  await loadNextPage();
  isInitialLoading.value = false;
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
    <div class="box-cover overflow-hidden rounded-xl border border-border !shadow-card [background:var(--gradient-surface)] md:rounded-2xl">
      <img
        src="https://64.media.tumblr.com/10b6161cae7baa32395e40351205f4da/31d798f6f2dab6f4-e7/s1280x1920/f9473d8c9975d05c9cc9c143d4178164dcebcb3e.gif"
        class="h-full w-full"
      />
    </div>
    <RoundButton @click="onReset">
      <IconRefresh class="size-full" :class="{ 'animate-spin': isInitialLoading }" />
    </RoundButton>

    <div class="mt-2 md:mt-5">
      <LyricsSongShelf :playlist="allLyricsPlaylist" layout="grid" :max-items="0" :enable-view-more="false" @select="onSelect" />
    </div>

    <div v-if="isInitialLoading" class="mt-8 flex justify-center">
      <LyricsLoadingState />
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-[24px] border border-dashed border-border bg-surface px-6 py-8 text-center text-sm text-foreground-muted"
    >
      {{ error }}
    </div>

    <div v-else-if="isLoadingMore" class="mt-8 flex justify-center">
      <LyricsLoadingState />
    </div>

    <div
      v-else-if="!hasMore && !songs.length"
      class="mt-6 rounded-[24px] border border-dashed border-border bg-surface px-6 py-8 text-center text-sm text-foreground-muted"
    >
      No lyrics found in the catalog.
    </div>

    <div
      v-else-if="!hasMore && songs.length"
      class="mt-6 rounded-[24px] border border-border bg-primary-soft px-6 py-4 text-center text-sm text-foreground-muted"
    >
      You reached the end of the catalog.
    </div>
  </div>
</template>
