<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useBattery } from '~/stores/battery';

const batteryStore = useBattery();
const { batteryPercentage, isBatterySupported } = storeToRefs(batteryStore);

const batteryStatusText = computed(() => {
  if (!isBatterySupported.value) return 'Battery API not available';
  if (batteryPercentage.value >= 80) return 'Cloud energy is full';
  if (batteryPercentage.value >= 50) return 'Cloud energy is stable';
  if (batteryPercentage.value >= 20) return 'Cloud is getting sleepy';
  return 'Please plug in soon';
});

onMounted(() => {
  void batteryStore.initBattery();
});
</script>

<template>
  <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff7fb] via-[#ffffff] to-[#e9f4ff] p-3 text-[#2d3748]">
    <div class="pointer-events-none absolute -top-6 right-4 h-12 w-20 rounded-full bg-[#ffffff] opacity-80" />
    <div class="pointer-events-none absolute -top-3 right-14 h-10 w-14 rounded-full bg-[#fff0f8]" />
    <div class="pointer-events-none absolute -bottom-5 -left-3 h-11 w-16 rounded-full bg-[#eef7ff] opacity-80" />

    <div class="relative z-[2]">
      <div class="flex items-center justify-between">
        <p class="text-xs font-semibold uppercase tracking-wide text-[#7f9bc2]">Battery</p>
        <p class="text-sm font-bold tabular-nums text-[#5b6f8f]">{{ batteryPercentage }}%</p>
      </div>

      <div class="mt-3 rounded-full bg-[#dcecff] p-1">
        <div
          class="h-3 rounded-full bg-gradient-to-r from-[#7dc7ff] via-[#8fd8ff] to-[#a4e4ff] transition-all duration-500"
          :style="`width:${batteryPercentage}%`"
        />
      </div>

      <p class="mt-3 text-sm font-semibold text-[#47658b]">{{ batteryStatusText }}</p>
      <p class="mt-1 text-[11px] text-[#6f88ab]">
        {{ isBatterySupported ? 'Power level updates automatically.' : 'This browser does not expose battery details.' }}
      </p>
    </div>
  </section>
</template>
