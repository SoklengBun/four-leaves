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
  <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-soft via-card to-accent-soft p-3 text-foreground">
    <div class="pointer-events-none absolute -top-6 right-4 h-12 w-20 rounded-full bg-foreground opacity-10" />
    <div class="pointer-events-none absolute -top-3 right-14 h-10 w-14 rounded-full bg-primary opacity-20" />
    <div class="pointer-events-none absolute -bottom-5 -left-3 h-11 w-16 rounded-full bg-accent opacity-15" />

    <div class="relative z-[2]">
      <div class="flex items-center justify-between">
        <p class="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Battery</p>
        <p class="text-sm font-bold tabular-nums text-foreground">{{ batteryPercentage }}%</p>
      </div>

      <div class="mt-3 rounded-full bg-surface-hover p-1">
        <div
          class="h-3 rounded-full bg-gradient-to-r from-accent to-secondary transition-all duration-500"
          :style="`width:${batteryPercentage}%`"
        />
      </div>

      <p class="mt-3 text-sm font-semibold text-accent-strong">{{ batteryStatusText }}</p>
      <p class="mt-1 text-[11px] text-foreground-muted">
        {{ isBatterySupported ? 'Power level updates automatically.' : 'This browser does not expose battery details.' }}
      </p>
    </div>
  </section>
</template>
