<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useWeather } from '~/stores/weather';

const weatherStore = useWeather();
const {
  city,
  temperature,
  humidity,
  windSpeed,
  cloudCover,
  precipitation,
  isDay,
  weatherDescription,
  weatherEmoji,
  isWeatherLoading,
  lastWeatherFetchedAt,
} = storeToRefs(weatherStore);

const weatherMood = computed(() => {
  if (temperature.value >= 35) return 'Warm and sunny vibes';
  if (temperature.value >= 28) return 'Soft tropical breeze';
  if (temperature.value >= 22) return 'Cool and comfy sky';
  return 'A little chilly outside';
});

const comfortLabel = computed(() => {
  if (temperature.value >= 35) return 'Hot';
  if (temperature.value >= 28) return 'Warm';
  if (temperature.value >= 22) return 'Mild';
  return 'Cool';
});

const dayLabel = computed(() => (isDay.value ? 'Daytime' : 'Nighttime'));

const refreshedAt = computed(() => {
  if (!lastWeatherFetchedAt.value) return 'Waiting for first sync';

  const diffMinutes = Math.floor((Date.now() - lastWeatherFetchedAt.value) / 60000);
  if (diffMinutes < 1) return 'Updated just now';
  if (diffMinutes === 1) return 'Updated 1 min ago';
  if (diffMinutes < 60) return `Updated ${diffMinutes} mins ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return 'Updated 1 hour ago';
  return `Updated ${diffHours} hours ago`;
});

onMounted(() => {
  void weatherStore.initWeather();
});
</script>

<template>
  <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-card to-accent-soft p-3 text-foreground">
    <div class="cloud cloud-a pointer-events-none absolute -left-3 -top-5 h-12 w-16 rounded-full bg-foreground opacity-10" />
    <div class="cloud cloud-b pointer-events-none absolute -top-3 left-8 h-10 w-14 rounded-full bg-card opacity-40" />
    <div class="cloud cloud-c pointer-events-none absolute -right-4 top-3 h-14 w-20 rounded-full bg-card opacity-30" />

    <div class="relative z-[2]">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Weather</p>
          <p class="mt-1 max-w-[210px] truncate text-base font-semibold text-foreground">{{ city }}</p>
        </div>
        <span class="rounded-full bg-card px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-foreground-muted">{{ dayLabel }}</span>
      </div>

      <div class="mt-1 flex items-end gap-2">
        <span class="text-6xl leading-none">{{ weatherEmoji }}</span>
        <p class="text-4xl font-bold tabular-nums leading-none text-foreground">{{ temperature.toFixed(1) }}<span class="text-2xl">°C</span></p>
        <span class="mb-1 rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-accent-strong">{{ comfortLabel }}</span>
      </div>

      <p class="mt-2 text-base font-semibold text-accent-strong">{{ weatherDescription }}</p>
      <p class="mt-1 text-sm text-foreground-muted">{{ weatherMood }}</p>

      <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div class="rounded-xl bg-card px-2.5 py-2 text-foreground-muted">
          <p class="text-xs uppercase tracking-wide text-foreground-subtle">Humidity</p>
          <p class="text-sm font-semibold tabular-nums">{{ humidity }}%</p>
        </div>
        <div class="rounded-xl bg-card px-2.5 py-2 text-foreground-muted">
          <p class="text-xs uppercase tracking-wide text-foreground-subtle">Wind</p>
          <p class="text-sm font-semibold tabular-nums">{{ windSpeed.toFixed(1) }} km/h</p>
        </div>
        <div class="rounded-xl bg-card px-2.5 py-2 text-foreground-muted">
          <p class="text-xs uppercase tracking-wide text-foreground-subtle">Clouds</p>
          <p class="text-sm font-semibold tabular-nums">{{ cloudCover }}%</p>
        </div>
        <div class="rounded-xl bg-card px-2.5 py-2 text-foreground-muted">
          <p class="text-xs uppercase tracking-wide text-foreground-subtle">Rain (now)</p>
          <p class="text-sm font-semibold tabular-nums">{{ precipitation.toFixed(1) }} mm</p>
        </div>
      </div>

      <p class="mt-3 text-xs text-foreground-subtle">
        {{ isWeatherLoading ? 'Fluffy cloud is checking the sky...' : `${refreshedAt} · ${isDay ? 'Sun is up' : 'Moon is up'}` }}
      </p>

      <div v-if="isWeatherLoading" class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div class="loading-wave h-full w-1/3 rounded-full bg-accent" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.cloud {
  will-change: transform;
}

.cloud-a {
  animation: float-a 8s ease-in-out infinite;
}

.cloud-b {
  animation: float-b 6s ease-in-out infinite;
}

.cloud-c {
  animation: float-c 7s ease-in-out infinite;
}

.loading-wave {
  animation: wave 1.4s ease-in-out infinite;
}

@keyframes float-a {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(3px);
  }
}

@keyframes float-b {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
}

@keyframes float-c {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(4px);
  }
}

@keyframes wave {
  0% {
    transform: translateX(-10%);
  }
  50% {
    transform: translateX(120%);
  }
  100% {
    transform: translateX(-10%);
  }
}
</style>
