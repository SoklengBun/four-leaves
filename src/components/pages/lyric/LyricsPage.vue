<script setup lang="ts">
import { debouncedRef } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LyricsSongShelf from './components/LyricsSongShelf.vue';
import ArtistsShelf from './components/ArtistsShelf.vue';
import LyricsSearchBar, { type LyricsSearchType } from './components/LyricsSearchBar.vue';
import PlaylistSearchShelf from './components/PlaylistSearchShelf.vue';
import { SEARCH_DEBOUNCE_DELAY_MS } from '~/constants/search';
import useAppFetch from '~/services';
import { usePlayer } from '~/stores/player';
import { usePlaylist } from '~/stores/playlist.js';
import { getTodayStorageDate, normalizeHomeResponse, useHomeStorage } from '~/utils/home-storage';
import { normalizePlaylistItems } from '~/utils/lyrics';
import { useAuth } from '~/stores/auth.js';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const searchText = ref('');
const searchDebounce = debouncedRef(searchText, SEARCH_DEBOUNCE_DELAY_MS);
const searchType = ref<LyricsSearchType>('all');
const player = usePlayer();
const homeStorage = useHomeStorage();
const playlist = usePlaylist();
const { lists } = storeToRefs(playlist);

const isFetching = ref(false);
const isSearching = ref(false);
type SearchSection = 'songs' | 'artists' | 'playlists';
type SearchResults = {
  songs: Lyrics[];
  artists: LyricsArtist[];
  playlists: Playlist[];
};

const searchResults = ref<SearchResults>({ songs: [], artists: [], playlists: [] });
const searchErrors = ref<Partial<Record<SearchSection, string>>>({});
const searchRequestId = ref(0);

const todaySelection = computed(() => homeStorage.value.songs ?? []);
const featuredPlaylists = computed(() => homeStorage.value.playlists ?? []);

const hasSearchQuery = computed(() => searchText.value.trim().length > 0);
const isSearchPending = computed(() => searchDebounce.value.trim() !== searchText.value.trim());
const isSearchBusy = computed(() => isSearching.value || isSearchPending.value);
const visibleSearchSections = computed<SearchSection[]>(() => {
  if (searchType.value === 'all') return ['songs', 'artists', 'playlists'];
  return [`${searchType.value}s` as SearchSection];
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

const songSearchPlaylist = computed<Playlist>(() => {
  return {
    id: 0,
    name: 'Search Result',
    description: `Keyword  "${searchText.value}"`,
    isPublic: false,
    items: searchResults.value.songs,
  };
});

const searchArtists = computed(() => searchResults.value.artists);
const searchPlaylists = computed(() => searchResults.value.playlists);

const fetchLyrics = async () => {
  isFetching.value = true;
  try {
    const { data } = await useAppFetch('home').get().json();
    const payload = normalizeHomeResponse(data.value);
    if (!payload) return;

    const playlists = payload.playlists.map((playlist) => normalizePlaylistItems(playlist));

    homeStorage.value = {
      ...homeStorage.value,
      songs: payload.songs,
      playlists,
      artists: payload.artists,
      date: getTodayStorageDate(),
    };
  } finally {
    isFetching.value = false;
  }
};

const searchEndpoints: Record<SearchSection, string> = {
  songs: 'lyrics/search',
  artists: 'artist/search',
  playlists: 'playlist/search',
};

const resetSearchState = () => {
  searchResults.value = { songs: [], artists: [], playlists: [] };
  searchErrors.value = {};
};

const normalizeSearchPlaylists = (items: unknown): Playlist[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizePlaylistItems(item as RawPlaylist));
};

const fetchSearchSection = async (section: SearchSection, keyword: string) => {
  const { data } = await useAppFetch(`${searchEndpoints[section]}?q=${encodeURIComponent(keyword)}`)
    .get()
    .json();
  if (data.value?.code !== 0 || !Array.isArray(data.value.data)) {
    throw new Error(data.value?.message || `Unable to search ${section}`);
  }

  if (section === 'songs') return data.value.data as Lyrics[];
  if (section === 'artists') return data.value.data as LyricsArtist[];
  return normalizeSearchPlaylists(data.value.data);
};

const search = async (query: string, type: LyricsSearchType) => {
  const keyword = query.trim();
  if (!keyword) {
    searchRequestId.value += 1;
    resetSearchState();
    isSearching.value = false;
    return;
  }

  const requestId = ++searchRequestId.value;
  isSearching.value = true;
  resetSearchState();

  const sections: SearchSection[] = type === 'all' ? ['songs', 'artists', 'playlists'] : [`${type}s` as SearchSection];
  const results = await Promise.allSettled(sections.map((section) => fetchSearchSection(section, keyword)));

  if (requestId !== searchRequestId.value || keyword !== searchDebounce.value.trim()) return;

  results.forEach((result, index) => {
    const section = sections[index];
    if (result.status === 'fulfilled') {
      if (section === 'songs') searchResults.value.songs = result.value as Lyrics[];
      if (section === 'artists') searchResults.value.artists = result.value as LyricsArtist[];
      if (section === 'playlists') searchResults.value.playlists = result.value as Playlist[];
    } else {
      searchErrors.value[section] = result.reason instanceof Error ? result.reason.message : 'Search failed';
    }
  });
  isSearching.value = false;
};

const searchSectionLabel = (section: SearchSection) => section;

const onSearchTypeChange = (type: LyricsSearchType) => {
  searchType.value = type;
  if (hasSearchQuery.value) {
    void search(searchDebounce.value, type);
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

watch(searchText, (value, previousValue) => {
  if (value.trim() !== previousValue.trim()) {
    searchRequestId.value += 1;
    resetSearchState();
    isSearching.value = false;
  }
});

watch(searchDebounce, (value) => void search(value, searchType.value));

const onClick = (lyrics: PlaylistItem, selectedPlaylist: Playlist | null = null) => {
  router.push({
    name: 'lyrics-detail',
    params: { id: lyrics.videoId },
    query: selectedPlaylist?.id && selectedPlaylist.id > 0 ? { playlistId: String(selectedPlaylist.id) } : undefined,
  });
  player.selectSong(lyrics, undefined, selectedPlaylist);
};

const onClear = () => {
  searchText.value = '';
  searchRequestId.value += 1;
  resetSearchState();
  isSearching.value = false;
};
</script>

<template>
  <div class="container flex w-full flex-col items-center px-3 pt-3">
    <div class="relative h-[200px] w-full p-3 md:h-[450px] md:p-5">
      <div class="absolute inset-0 w-full">
        <img src="https://i.redd.it/v60t49y990ue1.gif" class="box-cover size-full overflow-hidden rounded-card bg-black" />
      </div>
      <div class="relative z-10 flex size-full max-w-xl flex-col">
        <div class="mb-auto mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-[0.65rem] rounded-md bg-[color-mix(in_srgb,var(--color-card)_78%,transparent)] px-3 py-2 text-foreground-muted shadow-[inset_0_0_0_1px_var(--color-border)] transition-[transform,background-color] duration-[180ms] hover:-translate-y-px hover:bg-card-hover"
            :disabled="isFetching"
            @click="fetchLyrics"
          >
            <span class="text-[0.7rem] font-bold uppercase tracking-[0.18em]">{{ isFetching ? 'Refreshing' : 'Refresh Home' }}</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-[0.65rem] rounded-md bg-[color-mix(in_srgb,var(--color-card)_78%,transparent)] px-3 py-2 text-foreground-muted shadow-[inset_0_0_0_1px_var(--color-border)] transition-[transform,background-color] duration-[180ms] hover:-translate-y-px hover:bg-card-hover"
            @click="router.push({ name: 'lyrics-all' })"
          >
            <span class="text-[0.7rem] font-bold uppercase tracking-[0.18em]">Browse All</span>
          </button>
        </div>

        <LyricsSearchBar
          v-model="searchText"
          v-model:search-type="searchType"
          :loading="isSearchBusy"
          @update:search-type="onSearchTypeChange"
          @clear="onClear"
        />
      </div>
    </div>

    <div class="mt-5 flex w-full flex-col gap-6">
      <template v-if="hasSearchQuery">
        <div class="space-y-8">
          <template v-for="section in visibleSearchSections" :key="section">
            <LyricsSongShelf
              v-if="section === 'songs'"
              :playlist="songSearchPlaylist"
              :max-items="songSearchPlaylist.items.length"
              layout="grid"
              @select="(song) => onClick(song, null)"
            />

            <ArtistsShelf v-else-if="section === 'artists'" :artists="searchArtists" />

            <PlaylistSearchShelf v-else :playlists="searchPlaylists" />

            <div
              v-if="!isSearchBusy && !searchResults[section].length"
              class="box-cover rounded-[28px] border border-dashed border-border bg-surface px-6 py-8 text-center text-sm text-foreground-muted"
            >
              <template v-if="searchErrors[section]">{{ searchErrors[section] }}</template>
              <template v-else>No {{ searchSectionLabel(section) }} found for “{{ searchText.trim() }}”.</template>
            </div>
          </template>
        </div>
      </template>

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

        <template v-for="playlist in featuredPlaylists" :key="playlist.id">
          <LyricsSongShelf
            v-if="playlist.createdById !== auth.user?.id"
            :playlist="playlist"
            layout="grid"
            @select="(song) => onClick(song, playlist)"
          />
        </template>

        <ArtistsShelf :artists="homeStorage.artists ?? []" />
      </template>

      <div
        v-if="!hasSearchQuery && !todaySelection.length && !featuredPlaylists.length && !homeStorage.artists?.length && !isFetching"
        class="box-cover rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-foreground-muted"
      >
        No playlist data yet. Tap refresh to load the home feed.
      </div>
    </div>
  </div>
</template>
