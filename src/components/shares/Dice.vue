<script setup lang="ts">
defineProps<{ number: number }>();
</script>
<template>
  <div
    class="borde delay-100r h-[50px] w-[50px] overflow-hidden rounded transition-all"
  >
    <div
      v-if="number === 1"
      class="flex h-full w-full items-center justify-center bg-white"
    >
      <div class="h-[20%] w-[20%] rounded-full bg-red-500" />
    </div>

    <div v-else-if="number === 2" class="flex h-full w-full bg-white">
      <div class="flex h-full w-full -rotate-45 items-center justify-around">
        <div class="h-[20%] w-[20%] rounded-full bg-black" />
        <div class="h-[20%] w-[20%] rounded-full bg-black" />
      </div>
    </div>

    <div v-else-if="number === 3" class="flex h-full w-full bg-white">
      <div class="flex h-full w-full -rotate-45 items-center justify-around">
        <div class="h-[20%] w-[20%] rounded-full bg-black" />
        <div class="h-[20%] w-[20%] rounded-full bg-black" />
        <div class="h-[20%] w-[20%] rounded-full bg-black" />
      </div>
    </div>

    <div v-else-if="number === 4" class="flex h-full w-full flex-col bg-white">
      <div class="flex h-1/2 w-full items-center justify-around">
        <div class="h-[40%] w-[20%] rounded-full bg-red-500" />
        <div class="h-[40%] w-[20%] rounded-full bg-red-500" />
      </div>
      <div class="flex h-1/2 w-full items-center justify-around">
        <div class="h-[40%] w-[20%] rounded-full bg-red-500" />
        <div class="h-[40%] w-[20%] rounded-full bg-red-500" />
      </div>
    </div>

    <div
      v-else-if="number === 5"
      class="relative flex h-full w-full flex-col bg-white"
    >
      <div class="flex h-1/2 w-full items-center justify-around">
        <div class="h-[40%] w-[20%] rounded-full bg-black" />
        <div class="h-[40%] w-[20%] rounded-full bg-black" />
      </div>
      <div class="flex h-1/2 w-full items-center justify-around">
        <div class="h-[40%] w-[20%] rounded-full bg-black" />
        <div class="h-[40%] w-[20%] rounded-full bg-black" />
      </div>
      <div class="absolute flex h-full w-full items-center justify-center">
        <div class="h-[20%] w-[20%] rounded-full bg-black" />
      </div>
    </div>

    <div
      v-else-if="number === 6"
      class="relative flex h-full w-full flex-col bg-white"
    >
      <div class="flex h-1/3 w-full items-center justify-around">
        <div class="h-[60%] w-[20%] rounded-full bg-black" />
        <div class="h-[60%] w-[20%] rounded-full bg-black" />
      </div>
      <div class="flex h-1/3 w-full items-center justify-around">
        <div class="h-[60%] w-[20%] rounded-full bg-black" />
        <div class="h-[60%] w-[20%] rounded-full bg-black" />
      </div>
      <div class="flex h-1/3 w-full items-center justify-around">
        <div class="h-[60%] w-[20%] rounded-full bg-black" />
        <div class="h-[60%] w-[20%] rounded-full bg-black" />
      </div>
    </div>
  </div>
</template>
