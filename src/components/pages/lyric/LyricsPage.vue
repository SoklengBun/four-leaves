<script setup lang="ts">
import { debouncedRef, useFetch, useStorage } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const searchText = ref('');
const searchDebounce = debouncedRef(searchText);
const lyricsList = useStorage<Lyrics[]>('lyrics-list', []);
const isFetching = ref(false);

const searchResult = computed(() => {
  if (!searchDebounce.value) return lyricsList.value;

  return lyricsList.value.filter((e) => {
    const titleAndArtist = `${e.title.toLocaleLowerCase()} | ${e.artist.toLocaleLowerCase()}`;
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
      temp.push({
        id: i,
        title: e[0],
        artist: e[1],
        jp: e[2],
        romaji: e[3],
        url: e[4],
      });
    }
  });

  lyricsList.value = temp;
};

onMounted(async () => {
  if (!lyricsList.value?.length) {
    await fetchLyrics();
  }

  console.log(lyricsList.value[0]);

  const query = route.query.search?.toString();
  if (query) searchText.value = query;
});

const onClick = (id: number) => {
  router.push({ name: 'lyrics-detail', params: { id: id } });
};

const onClear = async () => {
  searchText.value = '';
  await fetchLyrics();
};
</script>

<template>
  <div
    class="container flex h-[calc(var(--body-height))] flex-col items-center pt-nav"
  >
    <div class="h-12 w-full">
      <div class="fetch size-12" @click="fetchLyrics"></div>
    </div>
    <div class="flex w-full items-center gap-2">
      <input
        v-model="searchText"
        class="h-[34px] w-full max-w-[300px] rounded-md border bg-white px-2 py-1 transition-colors duration-500 dark:bg-[#484848]"
      />

      <button
        @click="onClear"
        class="h-[34px] rounded-md border border-black/10 bg-gray-200 px-4 dark:bg-gray-700"
      >
        Clear
      </button>
    </div>
    <div class="flex w-full flex-1 flex-col overflow-auto py-2">
      <div
        v-for="lyrics in searchResult"
        @click="() => onClick(lyrics.id)"
        class="line-clamp-1 flex h-[34px] min-h-6 items-center break-all"
      >
        {{ lyrics.title }}
      </div>
    </div>
  </div>
</template>

<style>
.fetch {
  background-image: url('@/assets/images/yunli.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 48px 48px;
}
</style>
