<script setup lang="ts">
import { storeToRefs } from 'pinia';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import NextImage from '~/assets/images/player/next.png';
import PrevImage from '~/assets/images/player/previous.png';
import PauseImage from '~/assets/images/player/pause.png';
import PlayImage from '~/assets/images/player/play.png';

import { usePlayer } from '~/stores/player';

const player = usePlayer();
const { mode, current, src, isPlaying } = storeToRefs(player);

const togglePlay = () => {
  if (mode.value === 'off') return;

  if (isPlaying.value) {
    player.pause();
  } else {
    player.play();
  }
};
</script>

<template>
  <Teleport to="body">
    <div id="yt-player" class="hidden h-full w-full" />
    <Transition>
      <div v-if="mode !== 'off'" class="fixed bottom-0 h-player w-full px-3 pb-3 pt-2 md:p-5">
        <div class="liquid mx-auto flex h-full w-full max-w-[750px] items-center justify-center rounded-xl border border-[#efefef] md:rounded-2xl">
          <div class="relative z-10 flex h-fit flex-1 items-center space-x-1 overflow-hidden px-2 md:space-x-3 md:px-4">
            <div class="size-10 overflow-hidden rounded-lg border border-primary bg-gray-300 md:size-16 md:rounded-xl">
              <img :src="`https://img.youtube.com/vi/${src}/maxresdefault.jpg`" class="size-full object-cover" />
            </div>
            <MarqueeText :text="current?.title" class="min-w-0 flex-1 text-xs md:text-base" :gap="50" />
          </div>

          <div class="relative z-10 flex items-center px-2 md:flex-1">
            <button class="mx-1 size-6 md:size-8">
              <img :src="PrevImage" />
            </button>
            <button class="mx-2 size-6 md:mx-7 md:size-9" @click="togglePlay">
              <img :src="isPlaying ? PauseImage : PlayImage" />
            </button>
            <button class="mx-1 size-6 md:size-8">
              <img :src="NextImage" />
            </button>
          </div>
          <div class="relative z-10 hidden md:flex md:flex-1"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.liquid {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #ffd6e750 0%, #ffc8dd50 30%, #d8b4fe50 70%, #c4b5fd50 100%);
  box-shadow:
    inset 0 2px 8px rgba(255, 255, 255, 0.8),
    inset 0 -4px 12px rgba(255, 255, 255, 0.2),
    0 8px 24px rgba(216, 180, 254, 0.35);

  backdrop-filter: blur(4px);
}

.liquid::before {
  content: '';
  position: absolute;
  width: 180%;
  height: 180%;
  left: -40%;
  top: -120%;

  background: rgba(255, 255, 255, 0.4);
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

  background: rgba(255, 255, 255, 0.2);
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
