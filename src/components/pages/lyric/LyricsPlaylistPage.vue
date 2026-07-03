<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LyricsLoadingState from './components/LyricsLoadingState.vue';
import LyricsPlaylistMoreOptions from './components/LyricsPlaylistMoreOptions.vue';
import LyricsSongShelf from './components/LyricsSongShelf.vue';
import BackButton from '~/components/shares/BackButton.vue';
import CreatePlaylist from '~/components/music/CreatePlaylist.vue';
import MoreButton from '~/components/shares/MoreButton.vue';
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
    <MoreButton v-if="isOwner" aria-label="Playlist actions" @click="showMore = true" />

    <div
      class="mt-4 overflow-hidden rounded-[28px] border border-[#ffd7e8] bg-[linear-gradient(145deg,_#fff9fc_0%,_#fff0f7_52%,_#fff8fd_100%)] p-5 shadow-[0_20px_50px_#f5bfd73d] md:p-7"
    >
      <div v-if="list" class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#cf7ca6]">Playlist</p>
        <h1 class="text-3xl font-semibold text-[#2b1f28] md:text-4xl">{{ list.name }}</h1>
        <p v-if="list.description" class="max-w-2xl text-sm leading-6 text-[#755b6b] md:text-base">{{ list.description }}</p>

        <div class="flex flex-wrap gap-3">
          <div class="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-medium text-[#8c6177]">
            <span class="tabular-nums">{{ list.items.length }}</span> songs
          </div>
          <button
            type="button"
            class="rounded-full border border-[#ffd6e8] bg-white/80 px-4 py-2 text-sm font-semibold text-[#bc648f] transition-colors hover:bg-[#fff1f8]"
            :disabled="isLoading"
            @click="fetchPlaylist(true)"
          >
            {{ isLoading ? 'Refreshing...' : 'Refresh playlist' }}
          </button>
        </div>
      </div>

      <div v-else-if="!isLoading" class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#cf7ca6]">Playlist</p>
        <h1 class="text-2xl font-semibold text-[#2b1f28] md:text-3xl">Playlist not found</h1>
        <p class="text-sm text-[#755b6b] md:text-base">We couldn't load that playlist right now.</p>
      </div>
    </div>

    <LyricsLoadingState v-if="isLoading && !list" />

    <div v-else-if="list?.items.length" class="mt-5">
      <LyricsSongShelf :playlist="list" layout="grid" :max-items="0" :enable-view-more="false" @select="onSelect" />
    </div>

    <div
      v-else-if="list"
      class="mt-5 rounded-[24px] border border-dashed border-[#ffd7e8] bg-[#fffafc] px-5 py-10 text-center text-sm text-[#876c7b]"
    >
      This playlist does not have any songs yet.
    </div>

    <LyricsPlaylistMoreOptions v-if="list && isOwner" v-model:show="showMore" :playlist="list" />
    <CreatePlaylist />
  </div>
</template>
