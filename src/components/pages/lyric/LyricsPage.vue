<script setup lang="ts">
import { debouncedRef, useFetch, useStorage } from '@vueuse/core';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { useAppSetting } from '~/stores/app-setting';
import { usePlayer } from '~/stores/player';

const route = useRoute();
const router = useRouter();
const searchText = ref('');
const searchDebounce = debouncedRef(searchText);
const lyricsList = useStorage<Lyrics[]>('lyrics-list', []);
const containerRef = ref<HTMLDivElement>();
const appSetting = useAppSetting();
const player = usePlayer();

const isFetching = ref(false);

const searchResult = computed(() => {
  if (!searchDebounce.value) return lyricsList.value;

  return lyricsList.value.filter((e) => {
    const artistStr = e.artists ? e.artists.map((a) => a.name).join(', ') : e.artist || '';
    const titleAndArtist = `${e.title.toLocaleLowerCase()} | ${artistStr.toLocaleLowerCase()}`;
    return titleAndArtist.includes(searchDebounce.value.toLocaleLowerCase());
  });
});

const fetchLyrics = async () => {
  isFetching.value = true;
  const apiKey = import.meta.env.VITE_GOOGLE_SHEET;
  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
  const sheetName = 'Lyric';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

  const { data } = await useFetch(url);
  const jsonData = JSON.parse(data.value as string);

  let temp: Lyrics[] = [];
  (jsonData.values as string[][]).forEach((e, i) => {
    if (i !== 0) {
      let links = e[4];

      if (links.includes('[')) links = JSON.parse(e[4]);

      temp.push({
        id: i,
        title: e[0],
        artist: e[1],
        jp: e[2],
        romaji: e[3],
        url: links,
      });
    }
  });

  lyricsList.value = temp;
};

onMounted(async () => {
  if (!lyricsList.value?.length) {
    await fetchLyrics();
  }

  const query = route.query.search?.toString();
  if (query) searchText.value = query;

  if (!containerRef.value) return;
  const position = appSetting.getScrollPosition('lyric');

  containerRef.value.scrollTo({
    top: position,
    behavior: 'instant',
  });
});

onBeforeUnmount(() => {
  if (!containerRef.value) return;
  appSetting.setScrollPosition('lyric', containerRef.value.scrollTop);
});

const onClick = (lyrics: Lyrics) => {
  router.push({ name: 'lyrics-detail', params: { id: lyrics.id } });

  player.selectSong(lyrics);
};

const onClear = async () => {
  searchText.value = '';
  await fetchLyrics();
};
</script>

<template>
  <div class="flex w-full flex-col items-center px-3 pb-player pt-3">
    <div class="box-cover relative h-[200px] w-full overflow-hidden rounded-lg border bg-black">
      <div class="hero-banner absolute left-0 top-0 h-full w-full opacity-70" @click="fetchLyrics"></div>
      <div class="absolute left-1/2 top-1/2 w-[200px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white p-1 shadow-xl">
        <input
          v-model="searchText"
          class="h-[34px] w-full max-w-[300px] rounded-md border bg-white px-2 py-1 transition-colors duration-500 dark:border-gray-500 dark:bg-[#484848]"
        />
      </div>
    </div>

    <div class="mt-1 flex w-full flex-col space-y-2 pb-2 pt-1">
      <div class="text-lg font-semibold md:text-xl">My Playlist</div>
      <div class="flex space-x-2 overflow-x-auto">
        <div v-for="lyrics in searchResult" @click="() => onClick(lyrics)" class="lyric-item w-[80px] shrink-0 md:w-[140px]">
          <div class="size-[80px] rounded-md bg-gray-500 md:size-[140px]"></div>
          <MarqueeText :text="lyrics.title" class="mt-1 w-full text-center text-xs md:text-sm" />
        </div>
      </div>

      <div class="text-lg font-semibold md:text-xl">My Playlist</div>
      <div class="flex space-x-2 overflow-x-auto">
        <div v-for="lyrics in searchResult" @click="() => onClick(lyrics)" class="lyric-item w-[80px] shrink-0 md:w-[140px]">
          <div class="size-[80px] rounded-md bg-gray-500 md:size-[140px]"></div>
          <MarqueeText :text="lyrics.title" class="mt-1 w-full text-center text-xs md:text-sm" />
        </div>
      </div>

      <div class="text-lg font-semibold md:text-xl">My Playlist</div>
      <div class="flex space-x-2 overflow-x-auto">
        <div v-for="lyrics in searchResult" @click="() => onClick(lyrics)" class="lyric-item w-[80px] shrink-0 md:w-[140px]">
          <div class="size-[80px] rounded-md bg-gray-500 md:size-[140px]"></div>
          <MarqueeText :text="lyrics.title" class="mt-1 w-full text-center text-xs md:text-sm" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box-cover {
  @apply border border-primary;
  box-shadow:
    0 0 3px #ffb1ed,
    0 0 5px #f5fcff,
    0 0 10px #ffc1f7;
}

.hero-banner {
  background-image: url('https://redive.estertion.win/card/full/124131.webp');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.lyric-item {
  @apply flex flex-col items-center justify-center;
}
</style>
