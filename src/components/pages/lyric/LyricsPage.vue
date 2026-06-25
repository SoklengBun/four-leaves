<script setup lang="ts">
import { debouncedRef } from '@vueuse/core';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LyricsSongShelf from './components/LyricsSongShelf.vue';
import useAppFetch from '~/services';
import { useAppSetting } from '~/stores/app-setting';
import { usePlayer } from '~/stores/player';
import { getTodayStorageDate, useHomeStorage, type HomePlaylist } from '~/utils/home-storage';
import { getLyricsArtistLabel, normalizeLyrics, type HomeSong } from '~/utils/lyrics';

const route = useRoute();
const router = useRouter();
const searchText = ref('');
const searchDebounce = debouncedRef(searchText);
const containerRef = ref<HTMLDivElement | null>(null);
const appSetting = useAppSetting();
const player = usePlayer();
const homeStorage = useHomeStorage();

const isFetching = ref(false);
const isSearching = ref(false);
const searchResults = ref<Lyrics[]>([]);
const searchError = ref('');

const lyricsList = computed({
  get: () => homeStorage.value.data?.songs ?? [],
  set: (songs: Lyrics[]) => {
    homeStorage.value = {
      ...homeStorage.value,
      data: {
        songs,
        playlists: homeStorage.value.data?.playlists ?? [],
      },
    };
  },
});

const playlists = computed({
  get: () => homeStorage.value.data?.playlists ?? [],
  set: (value: HomePlaylist[]) => {
    homeStorage.value = {
      ...homeStorage.value,
      data: {
        songs: homeStorage.value.data?.songs ?? [],
        playlists: value,
      },
    };
  },
});

const filterLocalSongs = (query: string) => {
  const normalizedQuery = query.toLocaleLowerCase();

  return lyricsList.value.filter((e) => {
    const artistStr = getLyricsArtistLabel(e);
    const altTitleStr = e.altTitles?.join(' | ') || '';
    const titleAndArtist = `${e.title.toLocaleLowerCase()} | ${altTitleStr.toLocaleLowerCase()} | ${artistStr.toLocaleLowerCase()}`;
    return titleAndArtist.includes(normalizedQuery);
  });
};

const searchResult = computed(() => {
  if (!searchDebounce.value) return lyricsList.value;
  if (searchResults.value.length) return searchResults.value;
  return filterLocalSongs(searchDebounce.value);
});

const playlistSections = computed(() =>
  playlists.value
    .map((playlist) => {
      const songs = (playlist.items ?? [])
        .map((item) => {
          const lyricsId = Number(item.lyricsId ?? item.song?.id);
          const existingSong = lyricsList.value.find((song) => song.id === lyricsId);

          if (existingSong) return existingSong;
          if (item.song) return normalizeLyrics(item.song as HomeSong);
          return null;
        })
        .filter((song): song is Lyrics => Boolean(song));

      return {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        songs,
      };
    })
    .filter((playlist) => playlist.songs.length),
);

const searchDescription = computed(() => {
  if (!searchText.value) return '';
  if (isSearching.value) return `Searching songs for "${searchText.value}"...`;
  if (searchError.value) return searchError.value;
  if (!searchResult.value.length) return 'No songs matched your search yet.';
  return `Matches for "${searchText.value}"`;
});

const fetchLyrics = async () => {
  isFetching.value = true;
  try {
    const { data } = await useAppFetch('home').get().json();

    if (data.value?.code !== 0) return;

    const payload = data.value.data ?? {};
    lyricsList.value = Array.isArray(payload.songs) ? payload.songs.map((song: HomeSong) => normalizeLyrics(song)) : [];
    playlists.value = Array.isArray(payload.playlists) ? payload.playlists : [];
    homeStorage.value = {
      ...homeStorage.value,
      date: getTodayStorageDate(),
    };
  } finally {
    isFetching.value = false;
  }
};

const mergeLyricsCache = (songs: Lyrics[]) => {
  if (!songs.length) return;

  const cache = new Map(lyricsList.value.map((song) => [song.id, song]));
  songs.forEach((song) => {
    cache.set(song.id, {
      ...cache.get(song.id),
      ...song,
    });
  });
  lyricsList.value = Array.from(cache.values());
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
      const songs = data.value.data.map((song: never) => normalizeLyrics(song));
      searchResults.value = songs;
      mergeLyricsCache(songs);
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
  const hasHomeCacheForToday = homeStorage.value.date === getTodayStorageDate() && (lyricsList.value.length > 0 || playlists.value.length > 0);

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

const onClick = (lyrics: Lyrics) => {
  router.push({ name: 'lyrics-detail', params: { id: lyrics.videoId } });

  player.selectSong(lyrics);
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
      <div class="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(255,240,247,0.92)_48%,_rgba(255,227,239,0.88))]"></div>

      <div class="relative z-10 max-w-xl">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#d17ea8]">Lyrics Home</p>
        <h1 class="mt-3 text-3xl font-semibold text-[#2b1f28] md:text-5xl">Find a song and jump straight into the lyric view.</h1>
        <p class="mt-3 max-w-lg text-sm leading-6 text-[#725868] md:text-base">
          Browse featured playlists from the home API, or search across the full song list.
        </p>

        <div class="mt-5 flex flex-wrap gap-3">
          <div class="hero-chip">
            <span class="hero-chip__label">Songs</span>
            <span class="hero-chip__value">{{ lyricsList.length }}</span>
          </div>
          <div class="hero-chip">
            <span class="hero-chip__label">Playlists</span>
            <span class="hero-chip__value">{{ playlistSections.length }}</span>
          </div>
          <button type="button" class="hero-chip hero-chip--button" :disabled="isFetching" @click="fetchLyrics">
            <span class="hero-chip__label">{{ isFetching ? 'Refreshing' : 'Refresh Home' }}</span>
          </button>
          <div v-if="isSearching" class="hero-chip">
            <span class="hero-chip__label">Searching</span>
          </div>
        </div>

        <div
          class="mt-6 flex max-w-md items-center gap-3 rounded-[22px] border border-white/80 bg-white/85 p-2 shadow-[0_18px_40px_rgba(255,180,210,0.22)] backdrop-blur"
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
      <LyricsSongShelf
        v-if="searchText"
        title="Search Results"
        :description="searchDescription"
        :songs="searchResult"
        layout="grid"
        @select="onClick"
      />

      <template v-else>
        <LyricsSongShelf
          v-if="lyricsList.length"
          title="Today selection"
          description="10 songs from the home feed"
          :songs="lyricsList"
          layout="grid"
          @select="onClick"
        />

        <LyricsSongShelf
          v-for="playlist in playlistSections"
          :key="playlist.id"
          :title="playlist.name"
          :description="playlist.description"
          :songs="playlist.songs"
          layout="grid"
          @select="onClick"
        />
      </template>

      <div
        v-if="!searchText && !playlistSections.length && !isFetching"
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
  background: radial-gradient(circle at top right, rgb(255 216 233 / 70%), transparent 30%), linear-gradient(180deg, #fffafc 0%, #fff3f8 100%);
  box-shadow: 0 20px 45px rgb(255 178 210 / 18%);
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
  background: rgb(255 255 255 / 75%);
  padding: 0.7rem 0.95rem;
  color: #805d72;
  box-shadow: inset 0 0 0 1px rgb(255 215 232 / 85%);
}

.hero-chip--button {
  transition:
    transform 0.18s ease,
    background-color 0.18s ease;
}

.hero-chip--button:hover {
  transform: translateY(-1px);
  background: rgb(255 248 252 / 92%);
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
