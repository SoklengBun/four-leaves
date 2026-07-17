<script setup lang="ts">
import { useAppTheme } from '~/composables/useAppTheme';
import { requireImage } from '@/utils/helper';
const isDark = useAppTheme();
</script>

<template>
  <van-switch v-model="isDark" size="20px" class="border border-border" active-color="var(--color-primary)" inactive-color="var(--color-surface-hover)">
    <template #node>
      <div class="icon-wrapper">
        <img :src="requireImage(isDark ? 'moon.svg' : 'sun.svg')" class="icon h-[20px] w-[20px] rounded-full bg-surface" />
      </div>
    </template>
  </van-switch>
</template>

<style>
.icon-wrapper {
  display: flex;
  justify-content: center;
  font-size: 12px;
}
</style>
