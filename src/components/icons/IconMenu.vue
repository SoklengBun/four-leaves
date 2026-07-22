<script setup lang="ts">
defineProps<{ active?: boolean }>();
</script>

<template>
  <div
    class="relative size-10 after:absolute after:right-1.5 after:top-2 after:size-1.5 after:rounded-full after:bg-primary after:shadow-[0_0_0_1px_var(--color-primary-soft),0_0_6px_color-mix(in_srgb,var(--color-primary)_65%,transparent)] after:content-['']"
  >
    <div
      v-for="item in 4"
      :key="item"
      class="absolute left-1/2 top-1/2 size-[9px] rounded-[3px] transition-all duration-500 md:size-3"
      :class="[
        item === 1 && '-translate-x-[9.5px] -translate-y-[9.5px] md:-translate-x-[13px] md:-translate-y-[13px]',
        item === 2 && '-translate-y-[9.5px] translate-x-[0.5px] md:-translate-y-[13px] md:translate-x-px',
        item === 3 && '-translate-x-[9.5px] translate-y-[0.5px] md:-translate-x-[13px] md:translate-y-px',
        item === 4 && 'translate-x-[0.5px] translate-y-[0.5px] md:translate-x-px md:translate-y-px',
        active
          ? '!-translate-x-1/2 !-translate-y-1/2 !rounded-full !bg-[linear-gradient(125deg,var(--color-accent),var(--color-secondary))]'
          : 'bg-[linear-gradient(125deg,var(--color-primary),var(--color-secondary))]',
      ]"
    ></div>
  </div>
</template>
