<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import { onMounted } from "vue";
import { requireImage } from "@/utils/helper";
const fontSize = useStorage("font-size", "18px");

const fontSizeList = ["16px", "18px", "20px", "22px"];

const changeFontSize = (size: string) => {
  let root = document.querySelector(":root") as HTMLElement;
  root.style.setProperty("--over-all-font-size", size);
  fontSize.value = size;
};

onMounted(() => {
  let root = document.querySelector(":root") as HTMLElement;
  root.style.setProperty("--over-all-font-size", fontSize.value);
});
</script>
<template>
  <div class="group">
    <button
      class="flex border border-gray-400 bg-[#eee] dark:bg-[#555] rounded-full w-12 group-hover:scale-125 duration-300 items-center px-[2px]"
    >
      <img
        :src="requireImage('font-size.svg')"
        class="w-4 h-4 rounded-full bg-white border-[0.5px]"
      />
      <div class="w-full flex justify-center text-sm text-[16px]">
        {{ fontSize }}
      </div>
    </button>
    <div class="hidden group-hover:flex absolute top-0 w-full">
      <div
        class="flex flex-col items-start shadow-md dark:shadow-white/20 py-1 mt-8 w-full bg-white dark:bg-dark"
      >
        <button
          v-for="item in fontSizeList"
          :key="item"
          type="button"
          class="text-blue-400 hover:text-blue-500 hover:font-bold w-full hover:bg-white/20 flex items-start px-1"
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
