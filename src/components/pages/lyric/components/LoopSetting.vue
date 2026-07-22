<script setup lang="ts">
import { onClickOutside, useMediaQuery } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import CustomPopup from '~/components/shares/CustomPopup.vue';
import LoopSettingImage from '~/assets/images/player/loop-setting.png';
import { usePlayer } from '~/stores/player';

const player = usePlayer();
const { loopEnabled, loopPointA, loopPointB, hasValidLoopRange, currentTime } = storeToRefs(player);

const isMobile = useMediaQuery('(max-width: 767px)');
const isOpen = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const pointAInput = ref('');
const pointBInput = ref('');
const inputError = ref('');

const formatTime = (totalSeconds: number | null) => {
  if (totalSeconds === null || !Number.isFinite(totalSeconds) || totalSeconds < 0) return '--:--';

  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainSeconds).padStart(2, '0')}`;
};

const pointAText = computed(() => formatTime(loopPointA.value));
const pointBText = computed(() => formatTime(loopPointB.value));
const currentTimeText = computed(() => formatTime(currentTime.value));

const formatForInput = (totalSeconds: number | null) => {
  if (totalSeconds === null || !Number.isFinite(totalSeconds) || totalSeconds < 0) return '';

  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainSeconds).padStart(2, '0')}`;
};

const parseInputTime = (value: string) => {
  const v = value.trim();
  if (!v) return null;

  if (/^\d+(\.\d+)?$/.test(v)) {
    return Number(v);
  }

  if (!/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(v)) {
    return null;
  }

  const parts = v.split(':').map(Number);

  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null;

  if (parts.length === 2) {
    const [m, s] = parts;
    if (s >= 60) return null;
    return m * 60 + s;
  }

  const [h, m, s] = parts;
  if (m >= 60 || s >= 60) return null;
  return h * 3600 + m * 60 + s;
};

const applyInputPoints = () => {
  inputError.value = '';

  const parsedA = parseInputTime(pointAInput.value);
  const parsedB = parseInputTime(pointBInput.value);

  if (parsedA === null || parsedB === null) {
    inputError.value = 'Invalid format. Use seconds, mm:ss, or hh:mm:ss.';
    return;
  }

  if (parsedB <= parsedA) {
    inputError.value = 'Point B must be later than point A.';
    return;
  }

  player.setLoopPointA(parsedA);
  player.setLoopPointB(parsedB);

  pointAInput.value = formatForInput(loopPointA.value);
  pointBInput.value = formatForInput(loopPointB.value);
};

const togglePanel = () => {
  isOpen.value = !isOpen.value;
};

const closePanel = () => {
  isOpen.value = false;
  inputError.value = '';
};

const setPointA = () => {
  player.setLoopPointA();
  pointAInput.value = formatForInput(loopPointA.value);
  inputError.value = '';
};

const setPointB = () => {
  player.setLoopPointB();
  pointBInput.value = formatForInput(loopPointB.value);
  inputError.value = '';
};

const toggleLoop = () => {
  player.toggleLoopEnabled();
};

const clearLoop = () => {
  player.clearLoopRange();
  pointAInput.value = '';
  pointBInput.value = '';
  inputError.value = '';
};

watch(
  [loopPointA, loopPointB],
  ([a, b]) => {
    pointAInput.value = formatForInput(a);
    pointBInput.value = formatForInput(b);
  },
  { immediate: true },
);

onClickOutside(
  panelRef,
  () => {
    if (isMobile.value || !isOpen.value) return;
    closePanel();
  },
  {
    ignore: [triggerRef],
  },
);
</script>

<template>
  <div class="relative flex h-fit w-fit items-center justify-center">
    <button
      ref="triggerRef"
      type="button"
      class="ml-4 size-4 rounded-md transition-[opacity,transform] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:ml-8 md:size-6"
      :class="{ 'opacity-50': !loopEnabled }"
      aria-label="Open A/B loop settings"
      :aria-expanded="isOpen"
      @click="togglePanel"
    >
      <img :src="LoopSettingImage" alt="" aria-hidden="true" />
    </button>

    <div
      v-if="isOpen && !isMobile"
      ref="panelRef"
      class="absolute right-0 top-full z-30 mt-2 w-[260px] rounded-xl border border-border bg-card p-3 text-foreground shadow-card"
    >
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm font-semibold text-primary">Loop A/B</p>
        <span
          class="rounded-full px-2 py-[2px] text-[11px] font-semibold"
          :class="loopEnabled ? 'bg-accent-soft text-accent-strong' : 'bg-surface text-foreground-muted'"
        >
          {{ loopEnabled ? 'Active' : 'Off' }}
        </span>
      </div>

      <p class="mb-2 text-xs text-foreground-muted">
        Current time: <span class="tabular-nums">{{ currentTimeText }}</span>
      </p>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          @click="setPointA"
        >
          Set A
        </button>
        <button
          type="button"
          class="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          @click="setPointB"
        >
          Set B
        </button>
      </div>

      <div class="mt-3 rounded-lg bg-surface px-2 py-2 text-xs text-foreground-muted">
        <p class="tabular-nums">A: {{ pointAText }}</p>
        <p class="mt-1 tabular-nums">B: {{ pointBText }}</p>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <input
          v-model="pointAInput"
          type="text"
          inputmode="decimal"
          placeholder="A: 0:10"
          class="rounded-lg border border-border-strong bg-background-elevated px-2 py-1.5 text-xs text-foreground caret-primary outline-none transition-[border-color,box-shadow,background-color] placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary-soft"
        />
        <input
          v-model="pointBInput"
          type="text"
          inputmode="decimal"
          placeholder="B: 0:30"
          class="rounded-lg border border-border-strong bg-background-elevated px-2 py-1.5 text-xs text-foreground caret-primary outline-none transition-[border-color,box-shadow,background-color] placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary-soft"
        />
      </div>

      <button
        type="button"
        class="mt-2 w-full rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        @click="applyInputPoints"
      >
        Apply Typed A/B
      </button>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-lg px-2 py-1.5 text-xs font-semibold transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          :class="
            hasValidLoopRange
              ? 'bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover'
              : 'cursor-not-allowed bg-surface-hover text-foreground-subtle shadow-none'
          "
          :disabled="!hasValidLoopRange"
          @click="toggleLoop"
        >
          {{ loopEnabled ? 'Disable Loop' : 'Enable Loop' }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          @click="clearLoop"
        >
          Clear
        </button>
      </div>
      <p v-if="inputError" class="mt-2 text-[11px] text-danger">{{ inputError }}</p>
      <p v-if="!hasValidLoopRange" class="mt-2 text-[11px] text-danger">Set A first, then set B at a later time.</p>
    </div>

    <CustomPopup
      v-if="isMobile"
      v-model:show="isOpen"
      mobile-position="bottom"
      eyebrow="Player tools"
      title="Loop A/B"
      description="Set two time points and repeat that part of the track."
      @close="closePanel"
    >
      <div ref="panelRef" class="pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div class="mb-2 flex items-center justify-between">
          <span
            class="rounded-full px-2 py-[2px] text-[11px] font-semibold"
            :class="loopEnabled ? 'bg-accent-soft text-accent-strong' : 'bg-surface-hover text-foreground-muted'"
          >
            {{ loopEnabled ? 'Active' : 'Off' }}
          </span>
        </div>

        <p class="mb-3 text-sm text-foreground-muted">
          Current time: <span class="tabular-nums">{{ currentTimeText }}</span>
        </p>

        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            @click="setPointA"
          >
            Set A
          </button>
          <button
            type="button"
            class="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            @click="setPointB"
          >
            Set B
          </button>
        </div>

        <div class="mt-3 rounded-xl bg-surface-hover px-3 py-2 text-sm text-foreground-muted">
          <p class="tabular-nums">A: {{ pointAText }}</p>
          <p class="mt-1 tabular-nums">B: {{ pointBText }}</p>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <input
            v-model="pointAInput"
            type="text"
            inputmode="decimal"
            placeholder="A: 0:10"
            class="rounded-xl border border-border-strong bg-card px-3 py-2 text-sm text-foreground caret-primary outline-none transition-[border-color,box-shadow,background-color] placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
          <input
            v-model="pointBInput"
            type="text"
            inputmode="decimal"
            placeholder="B: 0:30"
            class="rounded-xl border border-border-strong bg-card px-3 py-2 text-sm text-foreground caret-primary outline-none transition-[border-color,box-shadow,background-color] placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>

        <button
          type="button"
          class="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          @click="applyInputPoints"
        >
          Apply Typed A/B
        </button>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-xl px-3 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            :class="
              hasValidLoopRange
                ? 'bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover'
                : 'cursor-not-allowed bg-surface-hover text-foreground-subtle shadow-none'
            "
            :disabled="!hasValidLoopRange"
            @click="toggleLoop"
          >
            {{ loopEnabled ? 'Disable Loop' : 'Enable Loop' }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            @click="clearLoop"
          >
            Clear
          </button>
        </div>

        <p v-if="inputError" class="mt-2 text-xs text-danger">{{ inputError }}</p>
        <p v-if="!hasValidLoopRange && !inputError" class="mt-2 text-xs text-danger">Set A first, then set B at a later time.</p>
      </div>
    </CustomPopup>
  </div>
</template>

<style scoped></style>
