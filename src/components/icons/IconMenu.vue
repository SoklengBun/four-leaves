<script setup lang="ts">
defineProps<{ active?: boolean }>();
</script>

<template>
  <div class="menu-box-container relative size-10" :class="{ active: active }">
    <div class="menu-box" v-for="item in 4" :key="item"></div>
  </div>
</template>

<style scoped>
.menu-box {
  @apply absolute left-1/2 top-1/2 size-[9px] rounded-[3px] transition-all duration-500 md:size-3;
  background: linear-gradient(125deg, var(--color-primary), var(--color-secondary));

  &:nth-child(1) {
    @apply -translate-x-[9.5px] -translate-y-[9.5px] md:-translate-x-[13px] md:-translate-y-[13px];
  }

  &:nth-child(2) {
    @apply -translate-y-[9.5px] translate-x-[0.5px] md:-translate-y-[13px] md:translate-x-[1px];
  }

  &:nth-child(3) {
    @apply -translate-x-[9.5px] translate-y-[0.5px] md:-translate-x-[13px] md:translate-y-[1px];
  }
  &:nth-child(4) {
    @apply translate-x-[0.5px] translate-y-[0.5px] md:translate-x-[1px] md:translate-y-[1px];
  }
}

.menu-box-container::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 6px;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-primary);
  box-shadow:
    0 0 0 1px var(--color-primary-soft),
    0 0 6px color-mix(in srgb, var(--color-primary) 65%, transparent);
}

.active .menu-box {
  @apply -translate-x-1/2 -translate-y-1/2;
  border-radius: 50%;
  background: linear-gradient(125deg, var(--color-accent), var(--color-secondary));
}
</style>
