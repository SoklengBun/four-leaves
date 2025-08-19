<script setup lang="ts">
import { useDark } from '@vueuse/core';
import { onMounted, onUnmounted, ref } from 'vue';
import CloudHeader from '~/components/icons/CloudHeader.vue';
import ThemeToggler from './ThemeToggler.vue';

const cloudOne = ref(0);
const cloudTwo = ref(-800);
const cloudOneDuration = ref(150);
const cloudTwoDuration = ref(150);

let interval: any;

onMounted(() => {
  interval = setInterval(() => {
    cloudOne.value += 1;
    cloudTwo.value += 1;

    if (cloudOne.value >= 800) {
      cloudOneDuration.value = 0;

      setTimeout(() => {
        cloudOne.value = -720;
      }, 50);
      setTimeout(() => {
        cloudOneDuration.value = 150;
      }, 100);
    }

    if (cloudTwo.value >= 800) {
      cloudTwoDuration.value = 0;

      setTimeout(() => {
        cloudTwo.value = -720;
      }, 50);
      setTimeout(() => {
        cloudTwoDuration.value = 150;
      }, 100);
    }
  }, 150);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="fixed top-0 z-50 flex h-nav w-full md:hidden">
    <!-- <div class="fixed z-[300]">{{ cloudOne }} || {{ cloudTwo }}</div> -->
    <div class="z-20 w-screen overflow-hidden">
      <div
        class="fixed left-0 top-0 flex min-w-[720px] overflow-hidden transition-all"
        :style="{
          transform: `translate(${cloudOne}px, 0px)`,
          transitionDuration: `${cloudOneDuration}ms`,
        }"
      >
        <CloudHeader class="w-[240px] min-w-[240px] -translate-y-[10px]" />
        <div
          class="relative flex w-[480px] min-w-[480px] items-end justify-end"
        >
          <CloudHeader
            class="absolute -left-[60px] -z-20 h-[65px] -translate-y-[20px] -scale-x-90"
          />
          <CloudHeader class="absolute -z-10 h-[90px] -translate-y-[5px]" />
        </div>
      </div>

      <div
        class="fixed left-0 top-0 flex min-w-[720px] overflow-hidden transition-all"
        :style="{
          transform: `translate(${cloudTwo}px, 0px)`,
          transitionDuration: `${cloudTwoDuration}ms`,
        }"
      >
        <CloudHeader class="w-[240px] min-w-[240px] -translate-y-[10px]" />
        <div
          class="relative flex w-[480px] min-w-[480px] items-end justify-end"
        >
          <CloudHeader
            class="absolute -left-[60px] -z-20 h-[65px] -translate-y-[20px] -scale-x-90"
          />
          <CloudHeader class="absolute -z-10 h-[90px] -translate-y-[5px]" />
        </div>
      </div>
    </div>

    <div
      class="fixed right-10 top-3 size-14 rounded-full bg-yellow-300 transition-all duration-300 dark:bg-[#c0d7e5]"
    ></div>
    <div
      class="fixed -top-[20px] right-[10px] z-30 size-[120px] rounded-full bg-yellow-200/20 blur-sm transition-all duration-300 dark:bg-[#38daff]/10"
    ></div>

    <ThemeToggler />
  </div>
</template>
