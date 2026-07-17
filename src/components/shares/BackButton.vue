<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = withDefaults(
  defineProps<{
    ariaLabel?: string;
  }>(),
  {
    ariaLabel: 'Go back',
  },
);

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<template>
  <button
    type="button"
    class="fixed left-3 top-3 z-20 mr-auto flex size-[40px] shrink-0 items-center justify-center rounded-full border-2 border-border-strong bg-surface text-primary shadow-primary transition-[transform,box-shadow] duration-150 active:scale-95 md:hidden"
    :aria-label="props.ariaLabel"
    @click="goBack"
  >
    <span
      class="relative inline-flex h-[18px] w-[18px] text-primary after:absolute after:-right-1 after:-top-0.5 after:h-[6px] after:w-[6px] after:rounded-full after:bg-primary after:content-['']"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 6.5L9 12L14.5 17.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </button>
</template>
