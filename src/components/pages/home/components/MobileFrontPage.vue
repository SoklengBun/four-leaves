<script setup lang="ts">
import Calendar from './Calendar.vue';
import BatteryWeather from './BatteryWeather.vue';

const tips = ['Break a leg!', "You've got this!", 'Blow them away!', 'Bring home the trophy!', 'Go make it happen.', 'You were made for this!'];
</script>

<template>
  <div class="mobile-front-container flex flex-col overflow-y-auto overflow-x-hidden overscroll-none p-3">
    <div class="background-image" />
    <div class="relative z-[2] flex flex-col">
      <img src="https://redive.estertion.win/card/full/124131.webp" class="box-cover h-[200px] w-full rounded-lg" />

      <BatteryWeather class="box-cover mt-3" />
      <Calendar class="box-cover mt-3" />
    </div>
  </div>
</template>

<style scoped>
.mobile-front-container {
  @apply relative h-body w-full md:hidden;

  background-color: #030923;
}

.background-image {
  @apply absolute left-0 top-0 h-full w-full opacity-50 blur-sm;
  background-image: url('https://redive.estertion.win/card/full/124131.webp');
  background-repeat: no-repeat;
  background-position: top center;
  background-size: auto 100%;
}

.box-cover {
  @apply border border-primary;
  box-shadow:
    0 0 3px #ffb1ed,
    0 0 5px #f5fcff,
    0 0 10px #ffc1f7;
}
</style>
