<script setup lang="ts">
import { useDark } from "@vueuse/core";
import { requireImage } from "@/utils/helper";
const isDark = useDark();
</script>

<template>
  <van-switch
    v-model="isDark"
    size="20px"
    class="border border-gray-400"
    active-color="#555"
    inactive-color="#eee"
  >
    <template #node>
      <div class="icon-wrapper">
        <img
          :src="requireImage(isDark ? 'moon.svg' : 'sun.svg')"
          class="icon h-[20px] w-[20px] rounded-full dark:bg-black"
        />
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
