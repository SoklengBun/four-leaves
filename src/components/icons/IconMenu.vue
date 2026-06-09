<script setup lang="ts">
defineProps<{ active?: boolean }>();
</script>

<template>
  <div class="relative size-10" :class="{ active: active }">
    <div class="menu-box" v-for="item in 4" :key="item"></div>
  </div>
</template>

<style scoped>
.menu-box {
  @apply absolute left-1/2 top-1/2 size-3 rounded-[3px] transition-all duration-500;
  background: linear-gradient(125deg, #f58ce9, #ffbddd);

  &:nth-child(1) {
    @apply -translate-x-[13px] -translate-y-[13px];
  }

  &:nth-child(2) {
    @apply -translate-y-[13px] translate-x-[1px];
  }

  &:nth-child(3) {
    @apply -translate-x-[13px] translate-y-[1px];
  }
  &:nth-child(4) {
    @apply translate-x-[1px] translate-y-[1px];
  }
}

.active .menu-box {
  @apply -translate-x-1/2 -translate-y-1/2;
  border-radius: 50%;
  background: linear-gradient(125deg, #8cc5f5, #bde1ff);
}
</style>
