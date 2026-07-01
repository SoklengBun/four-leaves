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
      class="ml-4 size-4 md:ml-8 md:size-6"
      :class="{ 'opacity-50': !loopEnabled }"
      aria-label="Open A/B loop settings"
      @click="togglePanel"
    >
      <img :src="LoopSettingImage" alt="Loop setting" />
    </button>

    <div
      v-if="isOpen && !isMobile"
      ref="panelRef"
      class="absolute right-0 top-full z-30 mt-2 w-[260px] rounded-xl border border-[#ffd5eb] bg-white p-3 shadow-[0_8px_24px_#ff8bc44d]"
    >
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm font-semibold text-[#ff4f9b]">Loop A/B</p>
        <span
          class="rounded-full px-2 py-[2px] text-[11px] font-semibold"
          :class="loopEnabled ? 'bg-[#d7ffe7] text-[#0f9151]' : 'bg-[#f3f4f6] text-[#6b7280]'"
        >
          {{ loopEnabled ? 'Active' : 'Off' }}
        </span>
      </div>

      <p class="mb-2 text-xs text-[#6b7280]">
        Current time: <span class="tabular-nums">{{ currentTimeText }}</span>
      </p>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-lg border border-[#ffd5eb] bg-[#fff7fc] px-2 py-1.5 text-xs font-semibold text-[#ff4f9b]"
          @click="setPointA"
        >
          Set A
        </button>
        <button
          type="button"
          class="rounded-lg border border-[#ffd5eb] bg-[#fff7fc] px-2 py-1.5 text-xs font-semibold text-[#ff4f9b]"
          @click="setPointB"
        >
          Set B
        </button>
      </div>

      <div class="mt-3 rounded-lg bg-[#fff4fb] px-2 py-2 text-xs text-[#5f5f66]">
        <p class="tabular-nums">A: {{ pointAText }}</p>
        <p class="mt-1 tabular-nums">B: {{ pointBText }}</p>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <input
          v-model="pointAInput"
          type="text"
          inputmode="decimal"
          placeholder="A: 0:10"
          class="rounded-lg border border-[#ffd5eb] bg-white px-2 py-1.5 text-xs text-[#4b5563] outline-none focus:border-[#ff4f9b]"
        />
        <input
          v-model="pointBInput"
          type="text"
          inputmode="decimal"
          placeholder="B: 0:30"
          class="rounded-lg border border-[#ffd5eb] bg-white px-2 py-1.5 text-xs text-[#4b5563] outline-none focus:border-[#ff4f9b]"
        />
      </div>

      <button
        type="button"
        class="mt-2 w-full rounded-lg border border-[#ffd5eb] bg-white px-2 py-1.5 text-xs font-semibold text-[#ff4f9b]"
        @click="applyInputPoints"
      >
        Apply Typed A/B
      </button>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-lg px-2 py-1.5 text-xs font-semibold text-white"
          :class="hasValidLoopRange ? 'bg-[#ff4f9b]' : 'cursor-not-allowed bg-[#f8b6d8]'"
          :disabled="!hasValidLoopRange"
          @click="toggleLoop"
        >
          {{ loopEnabled ? 'Disable Loop' : 'Enable Loop' }}
        </button>
        <button type="button" class="rounded-lg border border-[#ffd5eb] bg-white px-2 py-1.5 text-xs font-semibold text-[#ff4f9b]" @click="clearLoop">
          Clear
        </button>
      </div>
      <p v-if="inputError" class="mt-2 text-[11px] text-[#d14d7f]">{{ inputError }}</p>
      <p v-if="!hasValidLoopRange" class="mt-2 text-[11px] text-[#d14d7f]">Set A first, then set B at a later time.</p>
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
      <div ref="panelRef" class="bg-[linear-gradient(to_bottom,_#fff9fd,_#ffffff)] p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div class="mb-2 flex items-center justify-between">
          <span
            class="rounded-full px-2 py-[2px] text-[11px] font-semibold"
            :class="loopEnabled ? 'bg-[#d7ffe7] text-[#0f9151]' : 'bg-[#f3f4f6] text-[#6b7280]'"
          >
            {{ loopEnabled ? 'Active' : 'Off' }}
          </span>
        </div>

        <p class="mb-3 text-sm text-[#6b7280]">
          Current time: <span class="tabular-nums">{{ currentTimeText }}</span>
        </p>

        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-xl border border-[#ffd5eb] bg-[#fff7fc] px-3 py-2 text-sm font-semibold text-[#ff4f9b]"
            @click="setPointA"
          >
            Set A
          </button>
          <button
            type="button"
            class="rounded-xl border border-[#ffd5eb] bg-[#fff7fc] px-3 py-2 text-sm font-semibold text-[#ff4f9b]"
            @click="setPointB"
          >
            Set B
          </button>
        </div>

        <div class="mt-3 rounded-xl bg-[#fff4fb] px-3 py-2 text-sm text-[#5f5f66]">
          <p class="tabular-nums">A: {{ pointAText }}</p>
          <p class="mt-1 tabular-nums">B: {{ pointBText }}</p>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <input
            v-model="pointAInput"
            type="text"
            inputmode="decimal"
            placeholder="A: 0:10"
            class="rounded-xl border border-[#ffd5eb] bg-white px-3 py-2 text-sm text-[#4b5563] outline-none focus:border-[#ff4f9b]"
          />
          <input
            v-model="pointBInput"
            type="text"
            inputmode="decimal"
            placeholder="B: 0:30"
            class="rounded-xl border border-[#ffd5eb] bg-white px-3 py-2 text-sm text-[#4b5563] outline-none focus:border-[#ff4f9b]"
          />
        </div>

        <button
          type="button"
          class="mt-2 w-full rounded-xl border border-[#ffd5eb] bg-white px-3 py-2 text-sm font-semibold text-[#ff4f9b]"
          @click="applyInputPoints"
        >
          Apply Typed A/B
        </button>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-xl px-3 py-2 text-sm font-semibold text-white"
            :class="hasValidLoopRange ? 'bg-[#ff4f9b]' : 'cursor-not-allowed bg-[#f8b6d8]'"
            :disabled="!hasValidLoopRange"
            @click="toggleLoop"
          >
            {{ loopEnabled ? 'Disable Loop' : 'Enable Loop' }}
          </button>
          <button type="button" class="rounded-xl border border-[#ffd5eb] bg-white px-3 py-2 text-sm font-semibold text-[#ff4f9b]" @click="clearLoop">
            Clear
          </button>
        </div>

        <p v-if="inputError" class="mt-2 text-xs text-[#d14d7f]">{{ inputError }}</p>
        <p v-if="!hasValidLoopRange && !inputError" class="mt-2 text-xs text-[#d14d7f]">Set A first, then set B at a later time.</p>
      </div>
    </CustomPopup>
  </div>
</template>

<style scoped></style>
