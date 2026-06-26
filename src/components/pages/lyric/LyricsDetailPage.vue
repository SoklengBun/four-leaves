<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { usePlayer } from '~/stores/player';
import { useAuth } from '~/stores/auth';
import PlayerSeekBar from '~/components/music/PlayerSeekBar.vue';
import { UserRole } from '~/types/user';
import showToast from '~/utils/toast';

import NextImage from '~/assets/images/player/next.png';
import PrevImage from '~/assets/images/player/previous.png';
import PauseImage from '~/assets/images/player/pause.png';
import PlayImage from '~/assets/images/player/play.png';
import ShuffleImage from '~/assets/images/player/shuffle.png';
import RepeatImage from '~/assets/images/player/repeat.png';

import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import LoopSetting from './components/LoopSetting.vue';
import SongCoverList from './components/SongCoverList.vue';
import { getLyricsById } from '~/services/lyrics.js';

const router = useRouter();
const player = usePlayer();
const auth = useAuth();
const { videoId, artists, current, isPlaying, mode, shuffle, repeatOne, showPlaylist, playlist } = storeToRefs(player);

const currentLang = ref<LyricsKeys>('romaji');
const isLoading = ref(false);
const showActionSheet = ref(false);
const savedPlaylist = useLocalStorage<Playlist>('lyrics-saved-playlist', {
  id: -1,
  name: 'My Playlist',
  description: 'Songs saved from the lyric detail page.',
  isPublic: false,
  items: [],
});
const favoriteSongIds = useLocalStorage<string[]>('lyrics-favorite-song-ids', []);
const displayTitle = computed(() => getLyricsTitleLabel(current.value));
const displayArtist = computed(() => getLyricsArtistsLabel(artists.value));
const lyricsContent = computed(() => current.value?.contents?.find((e) => e.kind === currentLang.value)?.content ?? '');
const isAdmin = computed(() => auth.user?.role === UserRole.ADMIN);
const isFavorite = computed(() => {
  const songId = current.value?.videoId;
  return !!songId && favoriteSongIds.value.includes(songId);
});
const savedPlaylistCount = computed(() => savedPlaylist.value.items.length);

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

const closeActionSheet = () => {
  showActionSheet.value = false;
};

const togglePlay = () => {
  if (mode.value === 'off') return;

  if (isPlaying.value) {
    player.pause();
  } else {
    player.play();
  }
};

const addToPlaylist = () => {
  if (!current.value) return;

  const alreadySaved = savedPlaylist.value.items.some((song) => song.videoId === current.value?.videoId);
  if (alreadySaved) {
    showToast({ message: 'Song is already in My Playlist', type: 'warning' });
  } else {
    savedPlaylist.value = {
      ...savedPlaylist.value,
      items: [...savedPlaylist.value.items, { ...current.value }],
    };
    showToast({ message: 'Added to My Playlist', type: 'success' });
  }

  playlist.value = savedPlaylist.value;
  showPlaylist.value = true;
  closeActionSheet();
};

const toggleFavorite = () => {
  if (!current.value?.videoId) return;

  if (isFavorite.value) {
    favoriteSongIds.value = favoriteSongIds.value.filter((id) => id !== current.value?.videoId);
    showToast({ message: 'Removed from favorites', type: 'success' });
  } else {
    favoriteSongIds.value = [...favoriteSongIds.value, current.value.videoId];
    showToast({ message: 'Added to favorites', type: 'success' });
  }

  closeActionSheet();
};

const edit = () => {
  if (!current.value?.id) return;
  closeActionSheet();
  router.push({ name: 'lyrics-edit', params: { id: current.value.id } });
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
      aria-label="More actions"
      @click="showActionSheet = true"
    >
      <span class="fluffy-back-icon" aria-hidden="true">
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

    <van-popup v-model:show="showActionSheet" position="bottom" round :style="{ background: 'transparent' }" class="fluffy-action-popup">
      <div class="fluffy-action-sheet">
        <div class="fluffy-action-sheet__handle"></div>
        <p class="fluffy-action-sheet__eyebrow">Song actions</p>
        <h3 class="fluffy-action-sheet__title">{{ displayTitle || 'Current song' }}</h3>
        <p class="fluffy-action-sheet__subtitle">{{ displayArtist || 'Choose what you want to do next.' }}</p>

        <button type="button" class="fluffy-action-row" @click="addToPlaylist">
          <span class="fluffy-action-row__icon">+</span>
          <span class="fluffy-action-row__copy">
            <strong>Add to playlist</strong>
            <small>Save this song into your local listening queue.</small>
          </span>
        </button>

        <button type="button" class="fluffy-action-row" @click="toggleFavorite">
          <span class="fluffy-action-row__icon">{{ isFavorite ? '♥' : '♡' }}</span>
          <span class="fluffy-action-row__copy">
            <strong>{{ isFavorite ? 'Remove from favorite' : 'Add to favorite' }}</strong>
            <small>{{ isFavorite ? 'Take it out of your saved favorites.' : 'Keep this song in your quick favorite list.' }}</small>
          </span>
        </button>

        <button v-if="isAdmin" type="button" class="fluffy-action-row fluffy-action-row--admin" @click="edit">
          <span class="fluffy-action-row__icon">✎</span>
          <span class="fluffy-action-row__copy">
            <strong>Edit</strong>
            <small>Open the admin editor for this lyric entry.</small>
          </span>
        </button>

        <button type="button" class="fluffy-action-sheet__close" @click="closeActionSheet">Close</button>
      </div>
    </van-popup>
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

.fluffy-action-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #ffd7e9;
  border-radius: 9999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 239, 247, 0.92));
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #b05d89;
  box-shadow:
    0 10px 22px rgb(255 195 221 / 0.25),
    inset 0 1px 0 rgb(255 255 255 / 0.9);
}

.fluffy-action-pill--active {
  color: #d94884;
  border-color: #ffb7d3;
}

.fluffy-action-pill--admin {
  color: #8e5f78;
}

.fluffy-action-pill__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  line-height: 1;
}

.fluffy-meta-chip {
  border-radius: 9999px;
  background: rgba(255, 243, 248, 0.92);
  padding: 6px 10px;
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

.fluffy-action-popup {
  background: transparent;
}

.fluffy-action-sheet {
  padding: 14px 14px 20px;
  border-radius: 28px 28px 0 0;
  background: radial-gradient(circle at top right, rgba(255, 211, 229, 0.9), transparent 32%), linear-gradient(180deg, #fffafc 0%, #fff1f7 100%);
  box-shadow: 0 -10px 30px rgba(216, 143, 177, 0.18);
}

.fluffy-action-sheet__handle {
  width: 52px;
  height: 5px;
  margin: 0 auto 14px;
  border-radius: 9999px;
  background: rgba(208, 142, 175, 0.32);
}

.fluffy-action-sheet__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-align: center;
  color: #d583ab;
}

.fluffy-action-sheet__title {
  margin: 8px 0 0;
  text-align: center;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 800;
  color: #7d4d69;
}

.fluffy-action-sheet__subtitle {
  margin: 6px 0 16px;
  text-align: center;
  font-size: 13px;
  line-height: 1.5;
  color: #a67b92;
}

.fluffy-action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  border: 1px solid rgba(255, 215, 233, 0.95);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.86);
  text-align: left;
  color: #9a6782;
  box-shadow: 0 12px 24px rgba(235, 188, 210, 0.16);
}

.fluffy-action-row--admin {
  color: #825c71;
}

.fluffy-action-row__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 16px;
  background: linear-gradient(180deg, #fff7fb 0%, #ffe8f3 100%);
  font-size: 18px;
  line-height: 1;
}

.fluffy-action-row__copy {
  display: flex;
  flex-direction: column;
}

.fluffy-action-row__copy strong {
  font-size: 14px;
}

.fluffy-action-row__copy small {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.45;
  color: #af849a;
}

.fluffy-action-sheet__close {
  width: 100%;
  margin-top: 14px;
  padding: 12px 16px;
  border: 0;
  border-radius: 9999px;
  background: linear-gradient(180deg, #ff80b7 0%, #ff5ca0 100%);
  font-size: 13px;
  font-weight: 800;
  color: white;
  box-shadow: 0 14px 26px rgba(255, 109, 173, 0.22);
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
