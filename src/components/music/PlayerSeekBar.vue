<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { usePlayer } from '~/stores/player';

const props = withDefaults(
  defineProps<{
    timeClass?: string;
  }>(),
  {
    timeClass: 'text-xs text-foreground-muted',
  },
);

const player = usePlayer();
const { progress, currentTime, duration } = storeToRefs(player);

const isSeeking = ref(false);
const seekPercent = ref(0);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatTime = (totalSeconds: number) => {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';

  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainSeconds).padStart(2, '0')}`;
};

const currentDisplayTime = computed(() => {
  if (!isSeeking.value || !duration.value) return formatTime(currentTime.value);
  return formatTime((seekPercent.value / 100) * duration.value);
});

const durationDisplayTime = computed(() => formatTime(duration.value));

const seekTrackStyle = computed(() => {
  const ratio = clamp(seekPercent.value, 0, 100);
  return {
    background: `linear-gradient(to right, #5be8ff 0%, #5be8ff ${ratio}%, #e8f8ff ${ratio}%, #e8f8ff 100%)`,
  };
});

const onSeekInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  seekPercent.value = clamp(Number(target.value) || 0, 0, 100);
  isSeeking.value = true;
};

const onSeekCommit = () => {
  if (!duration.value) {
    isSeeking.value = false;
    return;
  }

  const targetTime = (seekPercent.value / 100) * duration.value;
  currentTime.value = targetTime;
  player.seekTo(targetTime);
  isSeeking.value = false;
};

watch(
  progress,
  (value) => {
    if (isSeeking.value) return;
    seekPercent.value = clamp(value || 0, 0, 100);
  },
  { immediate: true },
);
</script>

<template>
  <div class="w-full">
    <input
      class="player-seek h-1 w-full shrink-0 cursor-pointer appearance-none rounded-full"
      type="range"
      min="0"
      max="100"
      step="0.1"
      :value="seekPercent"
      :style="seekTrackStyle"
      @input="onSeekInput"
      @change="onSeekCommit"
    />

    <div class="flex w-full items-center justify-between tabular-nums" :class="props.timeClass">
      <p>{{ currentDisplayTime }}</p>
      <p>{{ durationDisplayTime }}</p>
    </div>
  </div>
</template>

<style scoped>
.player-seek {
  outline: none;
  filter: drop-shadow(0 0 2px #5be8ff) drop-shadow(0 0 8px #5be8ff88);
}

.player-seek::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 9999px;
  background: transparent;
  box-shadow:
    0 0 6px #5be8ff88,
    0 0 12px #5be8ff55;
}

.player-seek::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  margin-top: -4px;
  border-radius: 9999px;
  border: 1px solid #076875;
  background: radial-gradient(circle at 35% 35%, #ffffff 0%, #ddf9ff 45%, #6eefff 100%);
  box-shadow:
    0 0 0 1px #c9fbff,
    0 0 7px #5be8ff,
    0 0 14px #5be8ff99;
}

.player-seek::-moz-range-track {
  height: 4px;
  border-radius: 9999px;
  background: #e8f8ff;
  box-shadow:
    0 0 6px #5be8ff88,
    0 0 12px #5be8ff55;
}

.player-seek::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: 1px solid #9cf4ff;
  border-radius: 9999px;
  background: radial-gradient(circle at 35% 35%, #ffffff 0%, #ddf9ff 45%, #6eefff 100%);
  box-shadow:
    0 0 0 1px #c9fbff,
    0 0 7px #5be8ff,
    0 0 14px #5be8ff99;
}
</style>
