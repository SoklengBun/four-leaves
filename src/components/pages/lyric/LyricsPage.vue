<script setup lang="ts">
import { debouncedRef } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LyricsSongShelf from './components/LyricsSongShelf.vue';
import useAppFetch from '~/services';
import { useAppSetting } from '~/stores/app-setting';
import { usePlayer } from '~/stores/player';
import { usePlaylist } from '~/stores/playlist.js';
import { getTodayStorageDate, useHomeStorage } from '~/utils/home-storage';
import { getLyricsArtistsLabel, normalizePlaylistItems } from '~/utils/lyrics';
import Loading from '~/components/shares/Loading.vue';

const route = useRoute();
const router = useRouter();
const searchText = ref('');
const searchDebounce = debouncedRef(searchText);
const player = usePlayer();
const homeStorage = useHomeStorage();
const playlist = usePlaylist();
const { lists } = storeToRefs(playlist);

const isFetching = ref(false);
const isSearching = ref(false);
const searchResults = ref<Lyrics[]>([]);
const searchError = ref('');

const todaySelection = computed({
  get: () => homeStorage.value.songs ?? [],
  set: (value: Lyrics[]) => {
    homeStorage.value = {
      ...homeStorage.value,
      songs: value,
    };
  },
});

const featuredPlaylists = computed({
  get: () => homeStorage.value.playlists ?? [],
  set: (value: Playlist[]) => {
    homeStorage.value = {
      ...homeStorage.value,
      playlists: value,
    };
  },
});

const filterLocalSongs = (query: string) => {
  const normalizedQuery = query.toLocaleLowerCase();

  return todaySelection.value.filter((e) => {
    const artistStr = getLyricsArtistsLabel(e.artists);
    const altTitleStr = e.altTitles?.join(' | ') || '';
    const titleAndArtist = `${e.title.toLocaleLowerCase()} | ${altTitleStr.toLocaleLowerCase()} | ${artistStr.toLocaleLowerCase()}`;
    return titleAndArtist.includes(normalizedQuery);
  });
};

const searchResult = computed(() => {
  if (!searchDebounce.value) return todaySelection.value;
  if (searchResults.value.length) return searchResults.value;
  return filterLocalSongs(searchDebounce.value);
});

const toadySelectionPlaylist = computed<Playlist>(() => {
  return {
    id: 0,
    name: 'Today selection',
    description: '10 songs from the home feed',
    isPublic: false,
    items: todaySelection.value,
  };
});

const searchPlaylist = computed<Playlist>(() => {
  return {
    id: 0,
    name: 'Search Result',
    description: `Keyword  "${searchText.value}"`,
    isPublic: false,
    items: searchResult.value,
  };
});

const fetchLyrics = async () => {
  isFetching.value = true;
  try {
    const { data } = await useAppFetch('home').get().json();

    if (data.value?.code !== 0) return;

    const payload = data.value.data ?? {};
    todaySelection.value = Array.isArray(payload.songs) ? (payload.songs as Lyrics[]) : [];

    featuredPlaylists.value = Array.isArray(payload.playlists)
      ? payload.playlists.map((playlist: RawPlaylist) => normalizePlaylistItems(playlist))
      : [];
    homeStorage.value = {
      ...homeStorage.value,
      date: getTodayStorageDate(),
    };
  } finally {
    isFetching.value = false;
  }
};

const searchSongs = async (query: string) => {
  const keyword = query.trim();
  if (!keyword) {
    searchResults.value = [];
    searchError.value = '';
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  searchError.value = '';

  try {
    const { data } = await useAppFetch(`lyrics/search?q=${encodeURIComponent(keyword)}`)
      .get()
      .json();
    if (query.trim() !== searchDebounce.value.trim()) return;

    if (data.value?.code === 0 && Array.isArray(data.value.data)) {
      const songs = data.value.data as Lyrics[];
      searchResults.value = songs;
      return;
    }

    searchResults.value = [];
    searchError.value = data.value?.message || 'No songs found.';
  } catch {
    if (query.trim() !== searchDebounce.value.trim()) return;
    searchResults.value = [];
    searchError.value = 'Search failed. Showing local matches instead.';
  } finally {
    if (query.trim() === searchDebounce.value.trim()) {
      isSearching.value = false;
    }
  }
};

onMounted(async () => {
  const hasHomeCacheForToday =
    homeStorage.value.date === getTodayStorageDate() && (todaySelection.value.length > 0 || featuredPlaylists.value.length > 0);

  if (!hasHomeCacheForToday) {
    await fetchLyrics();
  }

  const query = route.query.search?.toString();
  if (query) searchText.value = query;
});

watch(searchDebounce, (value) => {
  if (!value.trim()) {
    searchResults.value = [];
    searchError.value = '';
    isSearching.value = false;
    return;
  }

  void searchSongs(value);
});

const onClick = (lyrics: PlaylistItem, selectedPlaylist: Playlist | null = null) => {
  router.push({ name: 'lyrics-detail', params: { id: lyrics.videoId } });
  player.selectSong(lyrics, undefined, selectedPlaylist);
};

const onClear = async () => {
  searchText.value = '';
  searchResults.value = [];
  searchError.value = '';
};
</script>

<template>
  <div class="container flex w-full flex-col items-center px-3 pt-3">
    <div class="box-cover relative h-[200px] w-full overflow-hidden rounded-card bg-black p-3 md:h-[450px] md:p-5">
      <div class="hero-banner absolute inset-0 w-full opacity-80">
        <img src="https://i.redd.it/v60t49y990ue1.gif" class="size-full" />
      </div>
      <div class="relative z-10 flex size-full max-w-xl flex-col">
        <div class="mt-5 flex flex-wrap gap-3">
          <button type="button" class="hero-chip hero-chip--button" :disabled="isFetching" @click="fetchLyrics">
            <span class="hero-chip__label">{{ isFetching ? 'Refreshing' : 'Refresh Home' }}</span>
          </button>
          <button type="button" class="hero-chip hero-chip--button" @click="router.push({ name: 'lyrics-all' })">
            <span class="hero-chip__label">Browse All</span>
          </button>
        </div>

        <div class="mt-auto flex w-full items-center rounded-md border border-border bg-card md:rounded-lg">
          <input
            v-model="searchText"
            placeholder="Search by title or artist or playlist"
            class="w-full rounded-2xl bg-transparent p-2 text-sm text-foreground outline-none placeholder:text-rose-300/40 md:p-3 md:text-base"
          />

          <Loading class="text-base md:text-lg" :class="{ 'opacity-0': !isSearching }" />
          <button
            v-if="searchText"
            type="button"
            class="mr-2 rounded-full px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft md:text-sm"
            @click="onClear"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <div class="mt-5 flex w-full flex-col gap-6">
      <LyricsSongShelf
        v-if="searchText"
        :playlist="searchPlaylist"
        :max-items="searchPlaylist.items.length"
        layout="grid"
        @select="(song) => onClick(song, null)"
      />

      <template v-else>
        <LyricsSongShelf
          v-for="playlist in lists"
          :key="`mine-${playlist.id}`"
          :playlist="playlist"
          layout="grid"
          @select="(song) => onClick(song, playlist)"
        />

        <LyricsSongShelf
          v-if="toadySelectionPlaylist.items.length"
          :playlist="toadySelectionPlaylist"
          layout="grid"
          :max-items="10"
          @select="(song) => onClick(song, toadySelectionPlaylist)"
        />

        <LyricsSongShelf
          v-for="playlist in featuredPlaylists"
          :key="playlist.id"
          :playlist="playlist"
          layout="grid"
          @select="(song) => onClick(song, playlist)"
        />
      </template>

      <div
        v-if="!searchText && !todaySelection.length && !isFetching"
        class="box-cover rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-foreground-muted"
      >
        No playlist data yet. Tap refresh to load the home feed.
      </div>

      <div
        v-if="searchText && !isSearching && !searchResult.length"
        class="box-cover rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-foreground-muted"
      >
        Try another title or artist name.
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-shell {
  background: var(--gradient-surface);
  box-shadow: var(--shadow-card);
}

.hero-banner {
  background-image: url('https://redive.estertion.win/card/full/124131.webp');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--color-card) 78%, transparent);
  padding: 0.7rem 0.95rem;
  color: var(--color-foreground-muted);
  box-shadow: inset 0 0 0 1px var(--color-border);
}

.hero-chip--button {
  transition:
    transform 0.18s ease,
    background-color 0.18s ease;
}

.hero-chip--button:hover {
  transform: translateY(-1px);
  background: var(--color-card-hover);
}

.hero-chip__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-chip__value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-foreground);
}
</style>
