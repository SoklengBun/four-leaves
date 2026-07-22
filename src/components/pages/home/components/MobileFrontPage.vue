<script setup lang="ts">
import Calendar from './Calendar.vue';
import BatteryWeather from './BatteryWeather.vue';

const tips = ['Break a leg!', "You've got this!", 'Blow them away!', 'Bring home the trophy!', 'Go make it happen.', 'You were made for this!'];
</script>

<template>
  <div class="relative flex h-body w-full flex-col overflow-y-auto overflow-x-hidden overscroll-none bg-background p-3 md:hidden">
    <div
      class="absolute left-0 top-0 size-full bg-[url('https://redive.estertion.win/card/full/124131.webp')] bg-[length:auto_100%] bg-top bg-no-repeat opacity-50 blur-sm"
    />
    <div class="relative z-[2] flex flex-col pb-player">
      <img src="https://redive.estertion.win/card/full/124131.webp" class="box-cover h-[200px] w-full rounded-card" />

      <BatteryWeather class="box-cover mt-3 rounded-card" />
      <Calendar class="box-cover mt-3 rounded-card" />
    </div>
  </div>
</template>
