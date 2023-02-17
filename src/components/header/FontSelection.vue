<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { onMounted } from 'vue';
import { requireImage } from '@/utils/helper';
const fontSize = useStorage('font-size', '18px');

const fontSizeList = ['16px', '18px', '20px', '22px'];

const changeFontSize = (size: string) => {
  let root = document.querySelector(':root') as HTMLElement;
  root.style.setProperty('--over-all-font-size', size);
  fontSize.value = size;
};

onMounted(() => {
  let root = document.querySelector(':root') as HTMLElement;
  root.style.setProperty('--over-all-font-size', fontSize.value);
});
</script>
<template>
  <div class="group hover:cursor-pointer">
    <button class="flex items-center duration-300 group-hover:scale-125">
      <img
        :src="requireImage('font-size.svg')"
        class="h-7 w-7 dark:contrast-0"
      />
    </button>
    <div class="absolute top-0 hidden w-12 group-hover:flex">
      <div
        class="mt-8 flex w-full flex-col items-start bg-white py-1 shadow-md dark:bg-dark dark:shadow-white/20"
      >
        <button
          v-for="item in fontSizeList"
          :key="item"
          type="button"
          class="flex w-full items-start px-1 text-blue-400 hover:bg-white/20 hover:font-bold hover:text-blue-500"
          :class="{ 'text-active': item === fontSize }"
          :style="{ 'font-size': item }"
          @click="changeFontSize(item)"
        >
          {{ item }}
        </button>
      </div>
    </div>
  </div>
</template>
