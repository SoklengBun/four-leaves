<script setup lang="ts">
import { useNow } from '@vueuse/core';

const now = useNow();
const days = ['Monday...', 'Tuesday...', 'Wednesday...', 'Thursday~', 'Friday~~!', 'Saturday!', 'Sunday.'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const tips = ['Break a leg!', "You've got this!", 'Blow them away!', 'Bring home the trophy!', 'Go make it happen.', 'You were made for this!'];
</script>

<template>
  <div class="mobile-front-container">
    <div class="background-image" />
    <div class="relative z-[2] flex flex-col">
      <img src="https://redive.estertion.win/card/full/124131.webp" class="box-cover h-[200px] w-full rounded-lg" />

      <div class="mt-3 flex space-x-3">
        <div class="box-cover flex flex-1 flex-col rounded-lg bg-green-50 px-2.5 py-2 text-[40px] leading-none">
          <div class="flex justify-between text-green-500">
            <span>{{ now.getDate().toString().padStart(2, '0') }}</span
            >•<span>{{ months[now.getMonth()] }}.</span>•
            <span>{{ now.getFullYear() }}</span>
          </div>
          <div class="mt-auto flex translate-y-0.5 items-center text-base leading-none text-gray-500">
            <span class="h-5 whitespace-nowrap"> It's {{ days[now.getDay()] }} </span>
            <div class="relative flex h-5 w-full justify-end overflow-hidden">
              <Transition
                class="absolute top-0 transition-all duration-500"
                enter-active-class="translate-y-0"
                enter-from-class="translate-y-[20px]"
                leave-from-class="-translate-y-[20px]"
              >
                <span v-if="Math.ceil(now.getSeconds() / 10) == 1 || Math.ceil(now.getSeconds() / 10) == 0">{{ tips[0] }}</span>
                <span v-else-if="Math.ceil(now.getSeconds() / 10) == 2">{{ tips[1] }}</span>
                <span v-else-if="Math.ceil(now.getSeconds() / 10) == 3">{{ tips[2] }}</span>
                <span v-else-if="Math.ceil(now.getSeconds() / 10) == 4">{{ tips[3] }}</span>
                <span v-else-if="Math.ceil(now.getSeconds() / 10) == 5">{{ tips[4] }}</span>
                <span v-else-if="Math.ceil(now.getSeconds() / 10) == 6">{{ tips[5] }}</span>
              </Transition>
            </div>
          </div>
        </div>

        <div class="box-cover w-[96px] rounded-lg bg-red-50 py-2">
          <div class="flex justify-center text-[40px] leading-none text-red-500">
            <div class="flex w-10 justify-center">
              {{ now.getHours().toString().padStart(2, '0') }}
            </div>
            :
            <div class="flex w-10 justify-center">
              {{ now.getMinutes().toString().padStart(2, '0') }}
            </div>
          </div>

          <div class="flex items-end justify-center text-gray-500">
            <div class="flex w-8 items-end text-[30px] leading-none">
              {{ now.getSeconds().toString().padStart(2, '0') }}
            </div>
            <span class="leading-[1.2]"> second </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-front-container {
  @apply relative h-body w-full p-3 md:hidden;

  background-color: rgb(3, 9, 35);
}

.background-image {
  @apply absolute left-0 top-0 h-full w-full opacity-50 blur-sm;
  background-image: url('https://redive.estertion.win/card/full/124131.webp');
  background-repeat: no-repeat;
  background-position: top center;
  background-size: auto 100%;
}

.box-cover {
  box-shadow:
    0 0 3px #ffb1ed,
    0 0 5px #f5fcff,
    0 0 10px #ffc1f7;
}
</style>
