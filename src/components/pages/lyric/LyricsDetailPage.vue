<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { usePlayer } from '~/stores/player';
import PlayerSeekBar from '~/components/music/PlayerSeekBar.vue';

import NextImage from '~/assets/images/player/next.png';
import PrevImage from '~/assets/images/player/previous.png';
import PauseImage from '~/assets/images/player/pause.png';
import PlayImage from '~/assets/images/player/play.png';
import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';

const router = useRouter();
const player = usePlayer();
const { src, current, isPlaying, mode } = storeToRefs(player);

const lyricsList = useStorage<Lyrics[]>('lyrics-list', []);
const lyrics = ref<Lyrics>();
const isExpand = ref(false);
const selectedLink = ref('');
const availableLang = ref<LyricsKeys[]>(['romaji']);
const languages = ['en', 'jp', 'romaji', 'kh', 'cn', 'pinyin'];
const currentLang = ref<LyricsKeys>('romaji');

onMounted(async () => {
  if (!lyricsList.value.length) {
    router.replace({ name: 'lyrics' });
  } else {
    const id = +router.currentRoute.value.params.id;

    const temp = lyricsList.value.find((e) => e.id === id);

    if (temp) {
      lyrics.value = temp;

      if (typeof lyrics.value.url === 'string') {
        selectedLink.value = lyrics.value.url;
      }

      if (typeof lyrics.value.url === 'object') {
        selectedLink.value = lyrics.value.url[0].l;
      }

      // Available Language
      let tempLang: LyricsKeys[] = [];
      Object.keys(temp).forEach((key) => {
        if (languages.includes(key)) tempLang.push(key as LyricsKeys);
      });
      availableLang.value = tempLang;

      if (tempLang.includes('romaji')) {
        currentLang.value = 'romaji';
      }

      if (tempLang.includes('pinyin')) {
        currentLang.value = 'pinyin';
      }
    }
  }
});

watch(
  () => player.isReady,
  () => {
    if (!player.src && lyrics.value) {
      player.selectSong(lyrics.value);
    }
  },
);

const onPlay = () => {
  isExpand.value = !isExpand.value;
};

const back = () => {
  router.back();
};

const onChangeLink = (link: string) => {
  if (selectedLink.value === link) return;

  selectedLink.value = link;
};

const switchLang = (lang: keyof Lyrics) => {
  currentLang.value = lang;
};

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
  <div class="flex h-full w-full flex-col items-center overflow-hidden">
    <div class="flex h-full w-full flex-col items-center overflow-auto overscroll-none px-3 pb-player pt-3">
      <button
        type="button"
        class="fluffy-back-btn sticky top-0 z-20 mr-auto flex size-[40px] shrink-0 items-center justify-center md:hidden"
        aria-label="Go back"
        @click="back"
      >
        <span class="fluffy-back-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 6.5L9 12L14.5 17.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </button>

      <div class="lyrics-box-cover mt-[-20px] size-[150px] shrink-0 overflow-hidden rounded-lg border bg-gray-100 md:mt-5">
        <YoutubeThumbnail :id="src" />
      </div>
      <div class="mt-2 flex h-[50px] w-full shrink-0 flex-col items-center justify-center space-y-1 px-2">
        <MarqueeText :text="current?.title" class="min-w-0 flex-1 shrink-0 text-lg font-bold" :gap="50" />
        <MarqueeText :text="current?.artist" class="min-w-0 flex-1 shrink-0 text-sm font-bold text-gray-500" :gap="50" />
      </div>

      <div class="mt-3 w-[340px]">
        <PlayerSeekBar time-class="text-xs text-gray-500" />

        <div class="flex w-full items-center justify-center">
          <button class="size-6 md:size-9" @click="player.playPrevious()"><img :src="PrevImage" /></button>
          <button class="mx-4 size-7 md:mx-10 md:size-10" @click="togglePlay"><img :src="isPlaying ? PauseImage : PlayImage" /></button>
          <button class="size-6 md:size-9" @click="player.playNext()"><img :src="NextImage" /></button>
        </div>
      </div>

      <div class="lyrics-box-cover mt-5 w-full flex-1 rounded-t-2xl bg-white pb-4 pt-4 md:max-w-[700px] md:rounded-b-2xl md:pb-6 md:pt-6">
        <p class="h-fit whitespace-pre-line text-center text-base lowercase">
          {{ current?.[currentLang] }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-lang {
  box-shadow:
    0px 2px 4px 4px #ff8b8b inset,
    0px 2px 4px 4px #ff3636;
}

.lyrics-box-cover {
  @apply rounded-xl border border-primary md:border-2;
  box-shadow:
    0 0 10px #ffb1ed,
    0 0 10px #f5fcff,
    0 0 20px #ffc1f7;
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
</style>
