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
import useAppFetch from '~/services';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import LoopSetting from './components/LoopSetting.vue';
import SongCoverList from './components/SongCoverList.vue';
import { getLyricsById } from '~/services/lyrics.js';

const router = useRouter();
const player = usePlayer();
const { videoId, artists, current, isPlaying, mode, shuffle, repeatOne, showPlaylist } = storeToRefs(player);

const currentLang = ref<LyricsKeys>('romaji');
const isLoading = ref(false);
const displayTitle = computed(() => getLyricsTitleLabel(current.value));
const displayArtist = computed(() => getLyricsArtistsLabel(artists.value));
const lyricsContent = computed(() => current.value?.contents?.find((e) => e.kind === currentLang.value)?.content ?? '');

const fetchLyricsDetail = async (id: string) => {
  isLoading.value = true;
  try {
    const song = await getLyricsById(id);
    if (!song) return null;
    current.value = song;
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

const edit = () => {
  showPlaylist.value = true;
  // router.push({ name: 'lyrics-edit', params: { id: current.value?.id } });
};
</script>

<template>
  <div class="flex h-full min-h-[80vh] w-full flex-col items-center px-3 pb-1 pt-3">
    <button
      type="button"
      class="fluffy-back-btn fixed left-3 top-3 z-20 mr-auto flex size-[40px] shrink-0 items-center justify-center md:hidden"
      aria-label="Go back"
      @click="back"
    >
      <span class="fluffy-back-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5 6.5L9 12L14.5 17.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>

    <button
      type="button"
      class="fluffy-back-btn fixed right-3 top-3 z-20 mr-auto flex size-[40px] shrink-0 items-center justify-center md:hidden"
      aria-label="Edit lyrics"
      @click="edit"
    >
      <span class="fluffy-back-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 20H8L18.5 9.5C19.3284 8.67157 19.3284 7.32843 18.5 6.5C17.6716 5.67157 16.3284 5.67157 15.5 6.5L5 17V20Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M13.5 8.5L16.5 11.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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

    <div v-if="isLoading" class="fluffy-loading flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
      <div class="fluffy-loading-cloud" aria-hidden="true">
        <span class="fluffy-loading-ear fluffy-loading-ear-left"></span>
        <span class="fluffy-loading-ear fluffy-loading-ear-right"></span>
        <span class="fluffy-loading-face">
          <span class="fluffy-loading-eye"></span>
          <span class="fluffy-loading-eye"></span>
          <span class="fluffy-loading-mouth"></span>
        </span>
      </div>
      <div class="mt-5 flex items-center gap-2 text-sm font-semibold text-[#ff7cb4]">
        <span>Fetching lyrics</span>
        <span class="fluffy-loading-dot"></span>
        <span class="fluffy-loading-dot"></span>
        <span class="fluffy-loading-dot"></span>
      </div>
    </div>

    <div v-else class="box-cover mt-5 w-full flex-1 rounded-t-2xl bg-white pb-4 pt-4 md:max-w-[700px] md:rounded-b-2xl md:pb-6 md:pt-6">
      <p class="h-fit whitespace-pre-line text-center text-base lowercase">
        {{ lyricsContent || 'No lyrics available' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.active-lang {
  box-shadow:
    0px 2px 4px 4px #ff8b8b inset,
    0px 2px 4px 4px #ff3636;
}

.fluffy-back-btn {
  border: 2px solid #ffcfe7;
  border-radius: 9999px;
  background: linear-gradient(160deg, #fff9fd 0%, #ffeaf5 100%);
  color: #ff4f9b;
  box-shadow:
    0 4px 10px #ffd9ec,
    0 0 0 4px #fff4fb inset;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.fluffy-back-btn:active {
  transform: scale(0.96);
  box-shadow:
    0 2px 8px #ffd2e8,
    0 0 0 4px #ffeef8 inset;
}

.fluffy-back-icon {
  position: relative;
  display: inline-flex;
  width: 18px;
  height: 18px;
  color: #ff4f9b;
}

.fluffy-back-icon svg {
  width: 100%;
  height: 100%;
}

.fluffy-back-icon::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -4px;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #fff;
  box-shadow:
    0 0 0 1px #ffd2ea,
    0 0 6px #fff7fc;
}

.fluffy-loading-cloud {
  position: relative;
  display: flex;
  height: 88px;
  width: 122px;
  align-items: center;
  justify-content: center;
  border: 3px solid #ffd3e7;
  border-radius: 9999px;
  background: linear-gradient(180deg, #fffafd 0%, #ffeef7 100%);
  box-shadow:
    0 14px 24px rgb(255 197 223 / 0.45),
    inset 0 -8px 14px rgb(255 230 241 / 0.95);
  animation: fluffy-float 1.8s ease-in-out infinite;
}

.fluffy-loading-cloud::before,
.fluffy-loading-cloud::after {
  content: '';
  position: absolute;
  bottom: 10px;
  border: 3px solid #ffd3e7;
  border-radius: 9999px;
  background: linear-gradient(180deg, #fffafd 0%, #ffeef7 100%);
}

.fluffy-loading-cloud::before {
  left: 10px;
  height: 48px;
  width: 48px;
}

.fluffy-loading-cloud::after {
  right: 10px;
  height: 58px;
  width: 58px;
}

.fluffy-loading-ear {
  position: absolute;
  top: -9px;
  z-index: -1;
  height: 24px;
  width: 24px;
  border: 3px solid #ffd3e7;
  border-radius: 9999px 9999px 10px 10px;
  background: #fff5fb;
}

.fluffy-loading-ear-left {
  left: 24px;
  transform: rotate(-16deg);
}

.fluffy-loading-ear-right {
  right: 24px;
  transform: rotate(16deg);
}

.fluffy-loading-face {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.fluffy-loading-eye {
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  background: #ff78af;
  animation: fluffy-blink 2.4s ease-in-out infinite;
}

.fluffy-loading-mouth {
  position: relative;
  height: 14px;
  width: 18px;
}

.fluffy-loading-mouth::before,
.fluffy-loading-mouth::after {
  content: '';
  position: absolute;
  top: 1px;
  height: 12px;
  width: 10px;
  border-bottom: 3px solid #ff78af;
  border-radius: 0 0 9999px 9999px;
}

.fluffy-loading-mouth::before {
  left: -1px;
  transform: rotate(12deg);
}

.fluffy-loading-mouth::after {
  right: -1px;
  transform: rotate(-12deg);
}

.fluffy-loading-dot {
  height: 8px;
  width: 8px;
  border-radius: 9999px;
  background: #ff9bc4;
  animation: fluffy-bounce 1s ease-in-out infinite;
}

.fluffy-loading-dot:nth-child(2) {
  animation-delay: 0.12s;
}

.fluffy-loading-dot:nth-child(3) {
  animation-delay: 0.24s;
}

.fluffy-loading-dot:nth-child(4) {
  animation-delay: 0.36s;
}

@keyframes fluffy-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

@keyframes fluffy-bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.55;
  }

  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

@keyframes fluffy-blink {
  0%,
  42%,
  100% {
    transform: scaleY(1);
  }

  46%,
  50% {
    transform: scaleY(0.2);
  }
}
</style>
