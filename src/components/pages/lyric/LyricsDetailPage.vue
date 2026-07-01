<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { usePlayer } from '~/stores/player';
import PlayerSeekBar from '~/components/music/PlayerSeekBar.vue';

import NextImage from '~/assets/images/player/next.png';
import PrevImage from '~/assets/images/player/previous.png';
import PauseImage from '~/assets/images/player/pause.png';
import PlayImage from '~/assets/images/player/play.png';
import ShuffleImage from '~/assets/images/player/shuffle.png';
import RepeatImage from '~/assets/images/player/repeat.png';

import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import LyricsLoadingState from './components/LyricsLoadingState.vue';
import LoopSetting from './components/LoopSetting.vue';
import SongCoverList from './components/SongCoverList.vue';
import CreatePlaylist from '~/components/music/CreatePlaylist.vue';
import { getLyricsById } from '~/services/lyrics.js';
import LyricsDetailMoreOptions from './components/LyricsDetailMoreOptions.vue';

const router = useRouter();
const player = usePlayer();
const { videoId, artists, current, isPlaying, mode, shuffle, repeatOne } = storeToRefs(player);

const currentLang = ref<LyricsKeys>('romaji');
const isLoading = ref(false);
const showMore = ref(false);
const displayTitle = computed(() => getLyricsTitleLabel(current.value));
const displayArtist = computed(() => getLyricsArtistsLabel(artists.value));
const lyricsContent = computed(() => current.value?.contents?.find((e) => e.kind === currentLang.value)?.content ?? '');

const fetchLyricsDetail = async (id: string, force = false) => {
  isLoading.value = true;
  try {
    const song = await getLyricsById(id, force);
    if (!song) return null;
    current.value = { ...current.value, ...song };
    return song;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const id = router.currentRoute.value.params.id;
  if (typeof id === 'string' && id) {
    fetchLyricsDetail(id);
  }
});

watch(
  () => router.currentRoute.value.params.id,
  (id, previousId) => {
    if (typeof id !== 'string' || !id || id === previousId) return;
    fetchLyricsDetail(id);
  },
);

watch(
  () => player.isReady,
  () => {
    if (!player.videoId && current.value) {
      player.selectSong(current.value);
    }
  },
);

const back = () => {
  router.back();
};

const togglePlay = () => {
  if (mode.value === 'off') return;

  if (isPlaying.value) {
    player.pause();
  } else {
    player.play();
  }
};

const refreshCurrentLyrics = () => {
  if (!videoId.value) return;
  void fetchLyricsDetail(videoId.value, true);
};
</script>

<template>
  <div class="flex h-full min-h-[80vh] w-full flex-col items-center px-3 pb-1 pt-3">
    <button
      type="button"
      class="fixed left-3 top-3 z-20 mr-auto flex size-[40px] shrink-0 items-center justify-center rounded-full border-2 border-[#ffcfe7] bg-[linear-gradient(160deg,#fff9fd_0%,#ffeaf5_100%)] text-[#ff4f9b] shadow-[0_4px_10px_#ffd9ec,inset_0_0_0_4px_#fff4fb] transition-[transform,box-shadow] duration-150 active:scale-95 active:shadow-[0_2px_8px_#ffd2e8,inset_0_0_0_4px_#ffeef8] md:hidden"
      aria-label="Go back"
      @click="back"
    >
      <span
        class="relative inline-flex h-[18px] w-[18px] text-[#ff4f9b] after:absolute after:-right-1 after:-top-0.5 after:h-[6px] after:w-[6px] after:rounded-full after:bg-white after:shadow-[0_0_0_1px_#ffd2ea,0_0_6px_#fff7fc] after:content-['']"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5 6.5L9 12L14.5 17.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>

    <button
      type="button"
      class="fixed right-3 top-3 z-20 mr-auto flex size-[40px] shrink-0 items-center justify-center rounded-full border-2 border-[#ffcfe7] bg-[linear-gradient(160deg,#fff9fd_0%,#ffeaf5_100%)] text-[#ff4f9b] shadow-[0_4px_10px_#ffd9ec,inset_0_0_0_4px_#fff4fb] transition-[transform,box-shadow] duration-150 active:scale-95 active:shadow-[0_2px_8px_#ffd2e8,inset_0_0_0_4px_#ffeef8] md:hidden"
      aria-label="More actions"
      @click="showMore = true"
    >
      <span
        class="relative inline-flex h-[18px] w-[18px] text-[#ff4f9b] after:absolute after:-right-1 after:-top-0.5 after:h-[6px] after:w-[6px] after:rounded-full after:bg-white after:shadow-[0_0_0_1px_#ffd2ea,0_0_6px_#fff7fc] after:content-['']"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6.5 12C6.5 12.8284 5.82843 13.5 5 13.5C4.17157 13.5 3.5 12.8284 3.5 12C3.5 11.1716 4.17157 10.5 5 10.5C5.82843 10.5 6.5 11.1716 6.5 12Z"
            fill="currentColor"
          />
          <path
            d="M13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12Z"
            fill="currentColor"
          />
          <path
            d="M20.5 12C20.5 12.8284 19.8284 13.5 19 13.5C18.1716 13.5 17.5 12.8284 17.5 12C17.5 11.1716 18.1716 10.5 19 10.5C19.8284 10.5 20.5 11.1716 20.5 12Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>

    <div class="relative mt-5 size-[150px] shrink-0">
      <YoutubeThumbnail :id="videoId" class="box-cover overflow-hidden rounded-lg" />
      <SongCoverList />
    </div>
    <div
      class="mt-2 flex h-[50px] w-full max-w-[340px] shrink-0 flex-col items-center justify-center space-y-1 overflow-hidden px-2 md:max-w-[450px]"
    >
      <MarqueeText :text="displayTitle" class="w-full min-w-0 shrink-0 text-center text-lg font-bold" :gap="50" />
      <MarqueeText :text="displayArtist" class="w-full min-w-0 shrink-0 text-center text-sm font-bold text-gray-500" :gap="50" />
    </div>

    <div class="mt-3 w-[340px] md:w-[450px]">
      <PlayerSeekBar time-class="text-xs text-gray-500" />

      <div class="flex w-full items-center justify-center">
        <div class="flex flex-1"></div>
        <button class="mr-4 size-4 md:mr-8 md:size-6" @click="player.toggleShuffle()" :class="{ 'opacity-50': !shuffle }">
          <img :src="ShuffleImage" />
        </button>
        <button class="size-6 md:size-8" @click="player.playPrevious()"><img :src="PrevImage" /></button>
        <button class="mx-4 size-7 md:mx-10 md:size-10" @click="togglePlay"><img :src="isPlaying ? PauseImage : PlayImage" /></button>
        <button class="size-6 md:size-8" @click="player.playNext()"><img :src="NextImage" /></button>
        <button class="ml-4 size-4 md:ml-8 md:size-6" @click="player.toggleRepeatOne()" :class="{ 'opacity-50': !repeatOne }">
          <img :src="RepeatImage" />
        </button>

        <div class="flex flex-1 justify-end">
          <LoopSetting />
        </div>
      </div>
    </div>

    <LyricsLoadingState v-if="isLoading" />

    <div v-else class="box-cover mt-5 w-full flex-1 rounded-t-2xl bg-white pb-4 pt-4 md:max-w-[700px] md:rounded-b-2xl md:pb-6 md:pt-6">
      <p class="h-fit whitespace-pre-line text-center text-base lowercase">
        {{ lyricsContent || 'No lyrics available' }}
      </p>
    </div>

    <LyricsDetailMoreOptions v-model:show="showMore" @refresh="refreshCurrentLyrics" />
    <CreatePlaylist />
  </div>
</template>
