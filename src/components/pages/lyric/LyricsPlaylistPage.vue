<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LyricsLoadingState from './components/LyricsLoadingState.vue';
import LyricsPlaylistMoreOptions from './components/LyricsPlaylistMoreOptions.vue';
import LyricsSongShelf from './components/LyricsSongShelf.vue';
import BackButton from '~/components/shares/BackButton.vue';
import CreatePlaylist from '~/components/music/CreatePlaylist.vue';
import RoundButton from '~/components/shares/RoundButton.vue';
import { useAuth } from '~/stores/auth';
import { usePlayer } from '~/stores/player';
import { usePlaylist } from '~/stores/playlist';
import { sleep } from '~/utils/helper.js';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const player = usePlayer();
const playlistStore = usePlaylist();
const { isLoading, list } = storeToRefs(playlistStore);
const showMore = ref(false);

const playlistId = computed(() => route.params.playlistId?.toString() ?? '');
const isOwner = computed(() => !!list.value && list.value.createdById === auth.user?.id);

const fetchPlaylist = async (force = false) => {
  if (!playlistId.value) return;
  await sleep(300);
  await playlistStore.getPlaylist(playlistId.value, force);
};

const onSelect = (song: PlaylistItem) => {
  if (!list.value) return;
  player.selectSong(song, undefined, list.value);
  router.push({ name: 'lyrics-detail', params: { id: song.videoId } });
};

onMounted(() => {
  fetchPlaylist();
});

watch(playlistId, (value, previousValue) => {
  if (!value || value === previousValue) return;
  fetchPlaylist();
});
</script>

<template>
  <div class="flex min-h-[80vh] w-full flex-col px-3 pt-3">
    <BackButton />
    <RoundButton v-if="isOwner" @click="showMore = true" />

    <div
      class="mt-4 overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-card via-surface to-primary-soft p-5 shadow-card md:p-7"
    >
      <div v-if="list" class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-primary">Playlist</p>
        <h1 class="text-3xl font-semibold text-foreground md:text-4xl">{{ list.name }}</h1>
        <p v-if="list.description" class="max-w-2xl text-sm leading-6 text-foreground-muted md:text-base">{{ list.description }}</p>

        <div class="flex flex-wrap gap-3">
          <div class="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground-muted">
            <span class="tabular-nums">{{ list.items.length }}</span> songs
          </div>
          <button
            type="button"
            class="rounded-full border border-border bg-primary-soft px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-card-hover"
            :disabled="isLoading"
            @click="fetchPlaylist(true)"
          >
            {{ isLoading ? 'Refreshing...' : 'Refresh playlist' }}
          </button>
        </div>
      </div>

      <div v-else-if="!isLoading" class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-primary">Playlist</p>
        <h1 class="text-2xl font-semibold text-foreground md:text-3xl">Playlist not found</h1>
        <p class="text-sm text-foreground-muted md:text-base">We couldn't load that playlist right now.</p>
      </div>
    </div>

    <LyricsLoadingState v-if="isLoading && !list" />

    <div v-else-if="list?.items.length" class="mt-5">
      <LyricsSongShelf :playlist="list" layout="grid" :max-items="0" :enable-view-more="false" @select="onSelect" />
    </div>

    <div
      v-else-if="list"
      class="mt-5 rounded-[24px] border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-foreground-muted"
    >
      This playlist does not have any songs yet.
    </div>

    <LyricsPlaylistMoreOptions v-if="list && isOwner" v-model:show="showMore" :playlist="list" />
    <CreatePlaylist />
  </div>
</template>
