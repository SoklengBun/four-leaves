<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const lyricsList = useStorage<Lyrics[]>('lyrics-list', []);
const lyrics = ref<Lyrics>();
const isExpand = ref(false);
const selectedLink = ref('');
const availableLang = ref<LyricsKeys[]>(['romaji']);
const languages = ['en', 'jp', 'romaji', 'kh', 'cn', 'pinyin'];
const currentLang = ref<LyricsKeys>('romaji');

onMounted(() => {
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
</script>

<template>
  <div
    class="flex h-[calc(var(--body-height))] flex-col items-center overflow-hidden pt-nav"
  >
    <div class="container flex h-10 w-full items-center">
      <button
        class="rounded-md border-[1.5px] border-primary px-2.5 py-0.5 text-primary"
        @click="back"
      >
        {{ '< Back' }}
      </button>
    </div>
    <div class="px-2 py-2">
      <div
        class="p rounded-lg border-2 border-primary px-5 py-1 text-xl text-primary"
      >
        <p class="text-center">
          {{ lyrics?.title }}
        </p>
      </div>
    </div>
    <div class="flex w-full flex-1 flex-col overflow-hidden">
      <div class="flex flex-1 overflow-hidden">
        <div class="flex flex-1 justify-center overflow-scroll py-2">
          <p class="h-fit whitespace-pre-line pb-5 text-center text-base">
            {{ lyrics?.[currentLang] }}
          </p>
        </div>
      </div>
      <div
        class="relative z-10 mt-auto flex h-0 w-full flex-col items-center justify-start border-t-[1.5px] border-primary transition-all duration-300"
        :class="{ '!h-[300px]': isExpand }"
      >
        <button
          @click="onPlay"
          class="absolute right-1 top-[-30px] z-[5] h-[30px] w-[70px] rounded-t-md bg-primary text-black"
        >
          Music
        </button>

        <!-- Available Language  -->
        <div
          class="absolute left-0 top-[-30px] z-[5] flex h-[30px] space-x-0.5 px-1"
        >
          <div
            v-for="lang in availableLang"
            :key="lang"
            class="flex h-full items-center rounded-t-md bg-primary px-4 capitalize"
            @click="switchLang(lang)"
          >
            <span :class="{ 'scale-125 text-white': currentLang === lang }">
              {{ lang }}
            </span>
          </div>
        </div>

        <iframe
          v-if="selectedLink"
          :src="`https://www.youtube.com/embed/${selectedLink}?si=0IWQ9Kbz7n-ixbBR`"
          :key="selectedLink"
          title="YouTube video player"
          frameborder="0"
          class="my-auto aspect-[375/240] h-[250px]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
        <div
          v-if="typeof lyrics?.url === 'object'"
          class="flex w-screen flex-1 items-center justify-center gap-2 overflow-x-auto py-2"
        >
          <div
            v-for="url in lyrics.url"
            :key="url.l"
            class="rounded-md border-[1.5px] border-primary px-3 py-0.5 text-primary"
            @click="onChangeLink(url.l)"
          >
            {{ url.a }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
