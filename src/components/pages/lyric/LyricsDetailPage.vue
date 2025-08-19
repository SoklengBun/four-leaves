<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const lyricsList = useStorage<Lyrics[]>('lyrics-list', []);
const lyrics = ref<Lyrics>();
const isExpand = ref(false);

onMounted(() => {
  if (!lyricsList.value.length) {
    router.replace({ name: 'lyrics' });
  } else {
    const id = +router.currentRoute.value.params.id;

    const temp = lyricsList.value.find((e) => e.id === id);

    if (temp) {
      lyrics.value = temp;
    }
  }
});

const onPlay = () => {
  isExpand.value = !isExpand.value;
  console.log('lyrice', lyrics.value);
};

const back = () => {
  router.back();
};
</script>

<template>
  <div
    class="flex h-[calc(var(--body-height))] flex-col items-center overflow-hidden pb-2 pt-nav"
  >
    <div class="container flex h-10 w-full items-center">
      <div class="" @click="back">{{ '< Back' }}</div>
    </div>
    <p class="pb-2 text-xl">{{ lyrics?.title }}</p>
    <div class="flex w-full flex-1 flex-col overflow-hidden">
      <div class="flex flex-1 overflow-hidden">
        <div class="flex flex-1 justify-center overflow-scroll py-5">
          <p class="h-fit whitespace-pre-line text-center text-base">
            {{ lyrics?.romaji }}
          </p>
        </div>
      </div>
      <div
        class="mt-auto flex h-5 w-full flex-col items-center justify-start overflow-hidden border-t transition-all duration-300"
        :class="{ '!h-[300px]': isExpand }"
      >
        <button @click="onPlay" class="mx-auto mb-2 w-fit">play music</button>

        <iframe
          v-if="lyrics?.url"
          width="460"
          height="250"
          :src="`https://www.youtube.com/embed/${lyrics?.url}?si=0IWQ9Kbz7n-ixbBR`"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>
