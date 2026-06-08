<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { usePlayer } from '~/stores/player';

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
    <div class="flex h-full w-full flex-col items-center overflow-auto overscroll-none pt-3">
      <div class="ml-3 mr-auto flex size-[40px] shrink-0 items-center justify-center rounded-full border text-[20px]" @click="back"><</div>

      <div class="mt-[-20px] size-[150px] shrink-0 overflow-hidden rounded-lg border bg-gray-100">
        <img :src="`https://img.youtube.com/vi/${src}/maxresdefault.jpg`" class="size-full object-cover" />
      </div>
      <div class="mt-2 flex h-[50px] w-full flex-col items-center justify-center space-y-1 px-2">
        <MarqueeText :text="current?.title" class="min-w-0 flex-1 shrink-0 text-lg font-bold" :gap="50" />
        <MarqueeText :text="current?.artist" class="min-w-0 flex-1 shrink-0 text-sm font-bold text-gray-500" :gap="50" />
      </div>

      <div class="mt-3 w-[340px]">
        <div class="h-1 w-full shrink-0 rounded-full bg-primary"></div>
        <div class="flex w-full shrink-0 items-center justify-between rounded-full text-xs text-gray-500">
          <p>0:00</p>
          <p>3:13</p>
        </div>

        <div class="flex w-full items-center justify-center">
          <button>⏮</button>
          <button class="mx-4 size-10 rounded-full bg-primary" @click="togglePlay">{{ isPlaying ? '❚❚' : '▶' }}</button>
          <button>⏭</button>
        </div>
      </div>

      <div class="pb-player mt-3 w-full rounded-t-2xl bg-white pt-4 shadow-xl shadow-red-500">
        <p class="h-fit whitespace-pre-line text-center text-base lowercase">
          {{ lyrics?.[currentLang] }}
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
</style>
