<script setup lang="ts">
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
    <div class="pointer-events-none z-20 w-screen overflow-hidden">
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

    <RouterLink to="/" class="sun-moon"></RouterLink>

    <ThemeToggler />
  </div>
</template>

<style scoped>
.sun-moon {
  @apply fixed right-10 top-3 size-[60px] rounded-full;

  background-color: #fff;

  --one: #ffa217;
  --two: #ffd900;
  --three: #ffd445;
  --four: #f5ff88;

  box-shadow:
    inset 0 0 10px var(--three),
    inset 4px 0 16px var(--two),
    inset -4px 0 16px var(--one),
    inset 4px 0 60px var(--two),
    inset -4px 0 60px var(--one),
    0 0 10px var(--three),
    -2px 0 16px var(--two),
    0px 0 150px var(--two),
    0px 0 300px var(--four),
    2px 0 16px var(--one);
}

.dark {
  .sun-moon {
    --one: #4f5499;
    --two: #84e6ff;
    --three: #d0f9ff;
    --four: #aee8ff;
  }
}
</style>
