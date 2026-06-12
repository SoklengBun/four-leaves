<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import SeasonalFall from '~/components/animation/SeasonalFall.vue';
import { useWeather } from '~/stores/weather';
import DesktopFrontPage from './components/DesktopFrontPage.vue';
import FirstLoad from './components/FirstLoad.vue';
import MobileFrontPage from './components/MobileFrontPage.vue';

const weatherStore = useWeather();
const { weatherCode, temperature, precipitation } = storeToRefs(weatherStore);

const weatherTexts = ['rain', 'snow', 'sakura', 'leaf'] as const;
const seasonalMode = computed(() => {
  // if ([95, 96, 99].includes(weatherCode.value)) return 'rain';
  // if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode.value)) return 'rain';
  // if (precipitation.value > 0.3) return 'rain';
  // if ([71, 73, 75, 77, 85, 86].includes(weatherCode.value)) return 'snow';
  // if (temperature.value <= 17) return 'snow';
  // if ([0, 1, 2, 3].includes(weatherCode.value) && temperature.value >= 30) return 'sakura';
  // return 'leaf';
  const weatherIndex = Math.floor(Math.random() * weatherTexts.length);
  return weatherTexts[weatherIndex];
});

onMounted(() => {
  void weatherStore.initWeather();
});

const onFirstLoadEnd = () => {};
</script>

<template>
  <SeasonalFall :mode="seasonalMode" />
  <FirstLoad @end="onFirstLoadEnd" />
  <MobileFrontPage />
  <DesktopFrontPage />
  <div class="h-player" />
</template>
