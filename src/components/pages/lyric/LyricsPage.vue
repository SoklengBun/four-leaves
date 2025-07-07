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
  <div class="container flex flex-col items-center py-4">
    <span>Search:</span>

    <div class="flex items-center justify-center gap-2">
      <input
        v-model="searchText"
        class="w-full max-w-[300px] rounded-md border px-2 py-1"
      />
      <button @click="onClear">Clear</button>
    </div>
    <div class="flex flex-col">
      <div v-for="lyrics in searchResult" @click="() => onClick(lyrics.id)">
        {{ lyrics.title }}
      </div>
    </div>
  </div>
</template>
