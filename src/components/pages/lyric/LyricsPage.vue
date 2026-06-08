<script setup lang="ts">
import { debouncedRef, useFetch, useStorage } from '@vueuse/core';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
  <div class="flex w-full flex-col items-center pt-nav">
    <div class="container h-12 w-full">
      <div class="fetch size-12" @click="fetchLyrics"></div>
    </div>
    <div class="container flex w-full items-center gap-2">
      <input
        v-model="searchText"
        class="h-[34px] w-full max-w-[300px] rounded-md border bg-white px-2 py-1 transition-colors duration-500 dark:border-gray-500 dark:bg-[#484848]"
      />

      <button
        @click="onClear"
        class="h-[34px] rounded-md border border-black/10 bg-gray-200 px-4 active:opacity-50 dark:border-gray-500 dark:bg-gray-700"
      >
        Clear
      </button>
    </div>

    <div class="container mt-1 flex w-full flex-col space-y-2 pb-5 pt-1">
      <div
        v-for="lyrics in searchResult"
        @click="() => onClick(lyrics)"
        class="lyric-item line-clamp-1 flex h-[34px] min-h-[34px] items-center break-all rounded-md px-2 active:opacity-50"
      >
        {{ lyrics.title }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.fetch {
  background-image: url('@/assets/images/yunli.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 48px 48px;
}

.lyric-item {
  background: rgb(255, 253, 241);
  box-shadow:
    2px 2px 4px 0px #ffee3895,
    2px 2px 8px 2px #ffd81737 inset;
}
.dark {
  .lyric-item {
    background: rgb(2, 23, 56);
    box-shadow:
      2px 2px 4px 0px #9dc1ff9b,
      2px 2px 8px 2px #ceefff93 inset;
  }
}
</style>
