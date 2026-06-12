<script setup lang="ts">
import { computed } from 'vue';
import { useNow } from '@vueuse/core';
import AnimateImage from '~/assets/images/animate.gif';

const now = useNow({ interval: 1000 });

const month = computed(() => now.value.getMonth());
const year = computed(() => now.value.getFullYear());
const monthName = computed(() => now.value.toLocaleString(undefined, { month: 'long' }));

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const firstDayIndex = computed(() => new Date(year.value, month.value, 1).getDay());

const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate());

const calendarCells = computed(() => {
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex.value; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth.value; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
});

const isToday = (day: number | null) => {
  if (!day) return false;
  const d = now.value;
  return d.getFullYear() === year.value && d.getMonth() === month.value && d.getDate() === day;
};

const timeString = computed(() => {
  return now.value.toLocaleTimeString();
});

const tzString = computed(() => {
  try {
    const parts = Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(now.value);
    return parts.find((p) => p.type === 'timeZoneName')?.value || Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
});
</script>

<template>
  <div class="relative w-full rounded-lg bg-card p-3">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex flex-col">
        <div class="text-lg font-bold text-purple-600">{{ monthName }}</div>
        <div class="text-sm text-gray-500">{{ year }}</div>
      </div>
      <div class="text-right">
        <div class="text-base font-semibold tabular-nums text-gray-800">{{ timeString }}</div>
        <div class="text-sm text-gray-400">{{ tzString }}</div>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2 text-sm font-bold">
      <div v-for="(d, i) in daysOfWeek" :key="d" :class="['text-center', i === 0 ? 'text-red-500' : i === 6 ? 'text-red-500' : 'text-gray-500']">
        {{ d }}
      </div>
    </div>

    <div class="mt-2 grid grid-cols-7 gap-2">
      <div
        v-for="(day, idx) in calendarCells"
        :key="idx"
        :class="[
          'flex min-h-10 transform items-center justify-center rounded-lg transition-transform',
          !day ? 'bg-transparent shadow-none' : 'bg-white shadow-sm',
          (() => {
            const weekday = idx % 7;
            if (isToday(day)) return 'active-day';
            if (!day) return '';
            return weekday === 0 ? 'text-red-500' : weekday === 6 ? 'text-red-500' : 'text-gray-700';
          })(),
        ]"
      >
        <span v-if="day" class="font-bold">{{ day }}</span>
      </div>
    </div>

    <img :src="AnimateImage" class="absolute -bottom-[7px] -right-[15px] size-32" />
  </div>
</template>

<style scoped>
.active-day {
  @apply border-2 border-primary text-xl font-bold text-blue-500;
  box-shadow:
    0 0 3px #ffb1ed,
    0 0 5px #f5fcff,
    0 0 10px #ffc1f7;
}
</style>
