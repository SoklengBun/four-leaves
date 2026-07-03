<script setup lang="ts">
import { debouncedRef } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LyricsSongShelf from './components/LyricsSongShelf.vue';
import useAppFetch from '~/services';
import { useAppSetting } from '~/stores/app-setting';
import { usePlayer } from '~/stores/player';
import { usePlaylist } from '~/stores/playlist.js';
import { getTodayStorageDate, useHomeStorage } from '~/utils/home-storage';
import { getLyricsArtistsLabel, normalizePlaylistItems } from '~/utils/lyrics';

const route = useRoute();
const router = useRouter();
const searchText = ref('');
const searchDebounce = debouncedRef(searchText);
const containerRef = ref<HTMLDivElement | null>(null);
const appSetting = useAppSetting();
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
    items: todaySelection.value.map((song) => ({
      ...song,
    })),
  };
});

const searchPlaylist = computed(() => {
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

  if (!containerRef.value) return;
  const position = appSetting.getScrollPosition('lyric');

  containerRef.value.scrollTo({
    top: position,
    behavior: 'instant',
  });
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

onBeforeUnmount(() => {
  if (!containerRef.value) return;
  appSetting.setScrollPosition('lyric', containerRef.value.scrollTop);
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
  <div ref="containerRef" class="container flex w-full flex-col items-center px-3 pb-4 pt-3">
    <div class="hero-shell box-cover relative w-full overflow-hidden rounded-[28px] border border-[#ffd5e7] p-5 md:p-8">
      <div class="hero-banner absolute inset-0 opacity-25"></div>
      <div class="absolute inset-0 bg-[linear-gradient(135deg,_#fffffff2,_#fff0f7eb_48%,_#ffe3eff0)]"></div>

      <div class="relative z-10 max-w-xl">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#d17ea8]">Lyrics Home</p>
        <h1 class="mt-3 text-3xl font-semibold text-[#2b1f28] md:text-5xl">Find a song and jump straight into the lyric view.</h1>
        <p class="mt-3 max-w-lg text-sm leading-6 text-[#725868] md:text-base">
          Browse featured playlists from the home API, or search across the full song list.
        </p>

        <div class="mt-5 flex flex-wrap gap-3">
          <div class="hero-chip">
            <span class="hero-chip__label">Songs</span>
            <span class="hero-chip__value">{{ todaySelection.length }}</span>
          </div>
          <div class="hero-chip">
            <span class="hero-chip__label">Playlists</span>
            <span class="hero-chip__value">{{ lists.length }}</span>
          </div>
          <button type="button" class="hero-chip hero-chip--button" :disabled="isFetching" @click="fetchLyrics">
            <span class="hero-chip__label">{{ isFetching ? 'Refreshing' : 'Refresh Home' }}</span>
          </button>
          <button type="button" class="hero-chip hero-chip--button" @click="router.push({ name: 'lyrics-all' })">
            <span class="hero-chip__label">Browse All</span>
          </button>
          <div v-if="isSearching" class="hero-chip">
            <span class="hero-chip__label">Searching</span>
          </div>
        </div>

        <div
          class="mt-6 flex max-w-md items-center gap-3 rounded-[22px] border border-white/80 bg-white/85 p-2 shadow-[0_18px_40px_#ffb4d238] backdrop-blur"
        >
          <input
            v-model="searchText"
            placeholder="Search by title or artist"
            class="h-11 w-full rounded-2xl bg-transparent px-3 text-sm text-[#2b1f28] outline-none placeholder:text-[#b393a5] md:text-base"
          />
          <button
            v-if="searchText"
            type="button"
            class="rounded-full bg-[#fff0f7] px-3 py-2 text-xs font-semibold text-[#c86496] transition-colors hover:bg-[#ffe4f1]"
            @click="onClear"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <div class="mt-5 flex w-full flex-col gap-6">
      <LyricsSongShelf v-if="searchText" :playlist="searchPlaylist" layout="grid" @select="(song) => onClick(song, null)" />

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
        class="box-cover rounded-[28px] border border-dashed border-[#ffd3e6] bg-white/70 px-6 py-10 text-center text-sm text-[#8b6f80]"
      >
        No playlist data yet. Tap refresh to load the home feed.
      </div>

      <div
        v-if="searchText && !isSearching && !searchResult.length"
        class="box-cover rounded-[28px] border border-dashed border-[#ffd3e6] bg-white/70 px-6 py-10 text-center text-sm text-[#8b6f80]"
      >
        Try another title or artist name.
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-shell {
  background: radial-gradient(circle at top right, #ffd8e9b3, transparent 30%), linear-gradient(180deg, #fffafc 0%, #fff3f8 100%);
  box-shadow: 0 20px 45px #ffb2d22e;
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
  background: #ffffffbf;
  padding: 0.7rem 0.95rem;
  color: #805d72;
  box-shadow: inset 0 0 0 1px #ffd7e8d9;
}

.hero-chip--button {
  transition:
    transform 0.18s ease,
    background-color 0.18s ease;
}

.hero-chip--button:hover {
  transform: translateY(-1px);
  background: #fff8fceb;
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
  color: #2b1f28;
}
</style>
