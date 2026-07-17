<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { computed, useAttrs } from 'vue';
import MarqueeText from './MarqueeText.vue';
import RoundButton from './RoundButton.vue';

type PopupPosition = 'center' | 'top' | 'right' | 'bottom' | 'left';

const props = withDefaults(
  defineProps<{
    desktopPosition?: PopupPosition;
    mobilePosition?: PopupPosition;
    eyebrow?: string;
    title?: string;
    description?: string;
    showClose?: boolean;
    animateTitle?: boolean;
  }>(),
  {
    desktopPosition: 'center',
    mobilePosition: 'bottom',
    eyebrow: '',
    title: '',
    description: '',
    showClose: true,
    animateTitle: true,
  },
);

const show = defineModel<boolean>('show', { required: true });
const emit = defineEmits<{ close: [] }>();

const attrs = useAttrs();
const isDesktop = useMediaQuery('(min-width: 768px)');

const currentPosition = computed(() => (isDesktop.value ? props.desktopPosition : props.mobilePosition));
const currentRound = computed(() => {
  if (currentPosition.value === 'right' || currentPosition.value === 'left') return false;
  if (currentPosition.value === 'center') return false;
  return true;
});

const currentStyle = computed(() => {
  if (currentPosition.value === 'right' || currentPosition.value === 'left') {
    return {
      background: 'transparent',
      width: 'min(88vw, 360px)',
      height: '100%',
    };
  }

  if (currentPosition.value === 'center') {
    return {
      background: 'transparent',
      width: 'min(92vw, 460px)',
    };
  }

  return {
    background: 'transparent',
    width: '100%',
    maxHeight: '90vh',
  };
});

const hasHeader = computed(() => !!props.eyebrow || !!props.title || !!props.description);
const isSidePopup = computed(() => currentPosition.value === 'right' || currentPosition.value === 'left');

const closePopup = () => {
  show.value = false;
  emit('close');
};
</script>

<template>
  <van-popup v-model:show="show" v-bind="attrs" :position="currentPosition" :round="currentRound" :style="currentStyle" class="bg-transparent">
    <div
      class="relative overflow-hidden border border-border bg-surface text-foreground shadow-2xl"
      :class="isSidePopup ? 'h-full rounded-none' : 'rounded-t-[30px] md:rounded-[32px]'"
    >
      <div class="pointer-events-none absolute -top-[18px] right-4 h-[140px] w-[140px] rounded-full bg-primary-soft opacity-90 blur-[16px]"></div>
      <div class="pointer-events-none absolute -bottom-[18px] -left-5 h-[150px] w-[150px] rounded-full bg-secondary-soft opacity-90 blur-[16px]"></div>

      <div class="relative z-[1] flex h-full min-h-0 flex-col px-[18px] pb-[18px] pt-[22px]">
        <div v-if="hasHeader || showClose" class="flex items-start justify-between gap-3">
          <div v-if="hasHeader" class="min-w-0">
            <p v-if="eyebrow" class="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">{{ eyebrow }}</p>
            <MarqueeText
              v-if="title && animateTitle"
              :text="title"
              :gap="32"
              :speed="36"
              class="m-0 w-full min-w-0 text-xl font-extrabold leading-[1.05] text-foreground"
            />
            <p v-else-if="title" class="m-0 w-full truncate text-xl font-extrabold leading-[1.05] text-foreground" :title="title">
              {{ title }}
            </p>
            <p v-if="description" class="mt-2 text-sm leading-[1.55] text-foreground-muted">{{ description }}</p>
          </div>

          <RoundButton v-if="showClose" @click="closePopup">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 7L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </RoundButton>
        </div>

        <div class="min-h-0 flex-1" :class="{ 'mt-[18px]': hasHeader || showClose }">
          <slot />
        </div>
      </div>
    </div>
  </van-popup>
</template>
