<script setup lang="ts">
import { storeToRefs } from 'pinia';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import NextImage from '~/assets/images/player/next.png';
import PrevImage from '~/assets/images/player/previous.png';
import PauseImage from '~/assets/images/player/pause.png';
import PlayImage from '~/assets/images/player/play.png';

import { usePlayer } from '~/stores/player';
import PlayerSeekBar from './PlayerSeekBar.vue';
import YoutubeThumbnail from './YoutubeThumbnail.vue';
import { useRouter } from 'vue-router';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics.js';
import { usePlaylist } from '~/stores/playlist.js';

const router = useRouter();

const player = usePlayer();
const { mode, current, videoId, artists, isPlaying, showPlaylist } = storeToRefs(player);

const playlist = usePlaylist();

const togglePlay = () => {
  if (mode.value === 'off') return;

  if (isPlaying.value) {
    player.pause();
  } else {
    player.play();
  }
};

const goToLyrics = () => {
  if (mode.value === 'off') return;
  if (router.currentRoute.value.name === 'lyrics-detail') return;

  router.push({ name: 'lyrics-detail', params: { id: current.value?.videoId } });
};

const togglePlaylist = () => {
  if (mode.value === 'off') return;

  showPlaylist.value = !showPlaylist.value;
};
</script>

<template>
  <Teleport to="body">
    <div id="yt-player" class="hidden h-full w-full" />
    <Transition>
      <div v-if="mode !== 'off'" class="fixed bottom-0 z-[99] h-player w-full px-3.5 pb-3 pt-2 md:p-5">
        <div
          class="liquid relative z-10 mx-auto flex h-full w-full max-w-[750px] items-center justify-center overflow-hidden rounded-xl border border-border pb-5 backdrop-blur-sm md:rounded-2xl md:pb-0"
        >
          <div class="relative z-10 flex h-fit flex-1 items-center space-x-1 overflow-hidden px-2 md:space-x-3 md:px-4">
            <div class="size-10 overflow-hidden rounded-lg border border-primary bg-surface md:size-16 md:rounded-xl">
              <YoutubeThumbnail :id="videoId" @click="goToLyrics" />
            </div>
            <div class="relative z-10 flex h-fit flex-1 flex-col justify-center overflow-hidden px-2 md:px-4">
              <MarqueeText :text="getLyricsTitleLabel(current)" class="w-full min-w-0 text-sm font-semibold md:text-base" :gap="50" />
              <MarqueeText :text="getLyricsArtistsLabel(artists)" class="w-full min-w-0 text-xs text-foreground-muted" :gap="50" />
            </div>
          </div>

          <div class="absolute bottom-2 w-[328px]">
            <PlayerSeekBar time-class="hidden" class="md:hidden" />
          </div>
          <div class="relative z-10 flex flex-col px-2 md:flex-1">
            <PlayerSeekBar time-class="text-[10px] text-foreground-muted md:text-xs" class="hidden md:block" />

            <div class="flex items-center justify-center">
              <button class="mx-1 size-6 md:size-8" @click="player.playPrevious()">
                <img :src="PrevImage" />
              </button>
              <button class="mx-2 size-6 md:mx-7 md:size-9" @click="togglePlay">
                <img :src="isPlaying ? PauseImage : PlayImage" />
              </button>
              <button class="mx-1 size-6 md:size-8" @click="player.playNext()">
                <img :src="NextImage" />
              </button>
            </div>
          </div>
          <div class="relative z-10 hidden md:flex md:flex-1"></div>
        </div>
        <div class="h-0 w-full">
          <div
            v-if="playlist?.list?.items?.length"
            class="liquid absolute right-0 top-1/2 flex h-10 w-[18px] -translate-y-1/2 items-center justify-center overflow-hidden rounded-r-md border border-l-0 border-border bg-primary-soft backdrop-blur-sm md:hidden"
            @click="togglePlaylist"
          >
            <svg class="h-3.5 w-3.5 text-secondary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6 4.5v11l8-5.5-8-5.5Z" />
            </svg>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.liquid {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary) 25%, transparent) 0%,
    color-mix(in srgb, var(--color-secondary) 25%, transparent) 100%
  );
  box-shadow:
    inset 0 2px 8px color-mix(in srgb, var(--color-foreground) 18%, transparent),
    inset 0 -4px 12px color-mix(in srgb, var(--color-background) 28%, transparent),
    0 8px 24px color-mix(in srgb, var(--color-secondary) 35%, transparent);
}

.liquid::before {
  content: '';
  position: absolute;
  width: 180%;
  height: 180%;
  left: -40%;
  top: -120%;

  background: color-mix(in srgb, var(--color-foreground) 14%, transparent);
  border-radius: 45%;

  animation: liquid-wave 8s linear infinite;
}

.liquid::after {
  content: '';
  position: absolute;
  width: 140%;
  height: 140%;
  left: -20%;
  top: -100%;

  background: color-mix(in srgb, var(--color-foreground) 8%, transparent);
  border-radius: 40%;

  animation: liquid-wave 12s linear infinite reverse;
}

@keyframes liquid-wave {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
