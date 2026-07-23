<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ArtistFormPopup, { type ArtistSavedPayload } from '~/components/artist/ArtistFormPopup.vue';
import LyricsLoadingState from './components/LyricsLoadingState.vue';
import LyricsSongShelf from './components/LyricsSongShelf.vue';
import BackButton from '~/components/shares/BackButton.vue';
import { getLyricsByArtist } from '~/services/lyrics';
import { useAuth } from '~/stores/auth';
import { usePlayer } from '~/stores/player';
import { getLyricsArtistName } from '~/utils/lyrics';
import { useHomeStorage } from '~/utils/home-storage';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const player = usePlayer();
const homeStorage = useHomeStorage();

const songs = ref<Lyrics[]>([]);
const isLoading = ref(false);
const error = ref('');
const showArtistForm = ref(false);
const artistFormMode = ref<'create' | 'edit'>('edit');

const artistId = computed(() => {
  const value = route.params.artistId;
  return Array.isArray(value) ? value[0] : value?.toString() ?? '';
});

const artist = computed(() => homeStorage.value.artists?.find((item) => item.id.toString() === artistId.value));
const artistName = computed(() => (artist.value ? getLyricsArtistName(artist.value) : `Artist #${artistId.value}`));

const artistPlaylist = computed<Playlist>(() => ({
  id: 0,
  name: artistName.value,
  description: `Songs by ${artistName.value}`,
  isPublic: false,
  items: songs.value,
}));

const fetchArtistSongs = async () => {
  if (!artistId.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    songs.value = await getLyricsByArtist(artistId.value);
  } catch {
    songs.value = [];
    error.value = 'Unable to load this artist’s songs right now.';
  } finally {
    isLoading.value = false;
  }
};

const onSelect = (song: PlaylistItem) => {
  player.selectSong(song, undefined, artistPlaylist.value);
  router.push({ name: 'lyrics-detail', params: { id: song.videoId } });
};

const openArtistForm = (mode: 'create' | 'edit') => {
  artistFormMode.value = mode;
  showArtistForm.value = true;
};

const onArtistSaved = (saved: ArtistSavedPayload) => {
  const savedId = saved.id ?? (artistFormMode.value === 'edit' ? Number(artistId.value) : undefined);
  if (!savedId) return;

  const updatedArtist: LyricsArtist = {
    ...(artist.value ?? { id: savedId }),
    id: savedId,
    name: saved.name,
    altName: saved.altName,
    cvId: saved.cvId,
    cv: saved.cv ?? null,
  };
  const artists = [...(homeStorage.value.artists ?? [])];
  const existingIndex = artists.findIndex((item) => item.id === savedId);

  if (existingIndex === -1) {
    artists.push(updatedArtist);
  } else {
    artists[existingIndex] = updatedArtist;
  }

  homeStorage.value = {
    ...homeStorage.value,
    artists,
  };

  if (artistFormMode.value === 'create') {
    router.push({ name: 'lyrics-artist', params: { artistId: savedId } });
  }
};

onMounted(() => {
  void fetchArtistSongs();
});

watch(artistId, (value, previousValue) => {
  if (!value || value === previousValue) return;
  void fetchArtistSongs();
});
</script>

<template>
  <div class="flex min-h-[80vh] w-full flex-col px-3 pb-6 pt-3">
    <BackButton />

    <section class="mt-4 overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-card via-surface to-primary-soft p-5 shadow-card md:p-7">
      <p class="text-xs font-semibold uppercase tracking-[0.32em] text-primary">Artist</p>
      <div class="mt-4 flex items-center gap-4">
        <div class="flex size-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-primary-soft to-secondary-soft text-xl font-bold text-primary shadow-sm md:size-20 md:rounded-[26px] md:text-2xl">
          {{ artist?.name.slice(0, 2) || '?' }}
        </div>
        <div class="min-w-0">
          <h1 class="truncate text-2xl font-semibold text-foreground md:text-4xl">{{ artistName }}</h1>
          <p class="mt-1 text-sm text-foreground-muted">Explore lyrics from this artist.</p>
        </div>
      </div>
      <div class="mt-5 inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground-muted">
        <span class="tabular-nums">{{ songs.length }}</span>&nbsp;{{ songs.length === 1 ? 'song' : 'songs' }}
      </div>
      <div v-if="auth.isLoggedIn" class="mt-4 flex flex-wrap gap-2">
        <button
          v-if="artist"
          type="button"
          class="rounded-full border border-border bg-primary-soft px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-card-hover"
          @click="openArtistForm('edit')"
        >
          Edit artist
        </button>
        <button
          type="button"
          class="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground-muted transition-colors hover:bg-card-hover"
          @click="openArtistForm('create')"
        >
          Add artist
        </button>
      </div>
    </section>

    <LyricsLoadingState v-if="isLoading" />

    <div v-else-if="error" class="mt-5 rounded-[24px] border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-foreground-muted">
      {{ error }}
    </div>

    <div v-else-if="songs.length" class="mt-5">
      <LyricsSongShelf :playlist="artistPlaylist" layout="grid" :max-items="0" :enable-view-more="false" @select="onSelect" />
    </div>

    <div v-else class="mt-5 rounded-[24px] border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-foreground-muted">
      No lyrics found for this artist yet.
    </div>

    <ArtistFormPopup
      v-model:show="showArtistForm"
      :artist="artist ?? null"
      :mode="artistFormMode"
      @saved="onArtistSaved"
    />
  </div>
</template>
