<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useBattery } from '~/stores/battery';
import { useWeather } from '~/stores/weather';

const batteryStore = useBattery();
const weatherStore = useWeather();

const { batteryPercentage } = storeToRefs(batteryStore);
const { city, temperature, weatherDescription, weatherEmoji } = storeToRefs(weatherStore);

onMounted(() => {
  void Promise.all([batteryStore.initBattery(), weatherStore.initWeather()]);
});
</script>
<template>
  <div class="flex items-center justify-evenly rounded-lg bg-card px-3 py-1 text-gray-800">
    <div class="flex items-center space-x-2">
      <div class="relative h-[18px] w-[30px] rounded border-2 border-gray-500 p-0.5">
        <div class="h-full w-[var(--battery-percent)] rounded-sm bg-primary" :style="`--battery-percent:${batteryPercentage}%`"></div>
        <div class="absolute -right-1 top-1/2 h-2 w-1 -translate-y-1/2 rounded-sm bg-gray-500"></div>
      </div>
      <span>{{ batteryPercentage }}%</span>
    </div>
    <div class="mx-1 h-3/5 w-0.5 rounded bg-primary" />

    <div class="flex items-center space-x-1 text-sm">
      <span class="text-3xl">{{ weatherEmoji }}</span>
      <span class="tabular-nums">{{ temperature.toFixed(1) }}°C</span>
      <span class="text-xs text-red-500">{{ weatherDescription }}</span>
    </div>

    <div class="mx-1 h-3/5 w-0.5 rounded bg-primary" />

    <div>{{ city }}</div>
  </div>
</template>
