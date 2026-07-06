<script setup lang="ts">
import Battery from './Battery.vue';
import Calendar from './Calendar.vue';
import Weather from './Weather.vue';
</script>

<template>
  <div class="desktop-container hidden h-body w-full overflow-y-auto overflow-x-hidden overscroll-none p-5 md:block">
    <div class="desktop-background" />

    <div class="container relative z-[2] flex gap-3">
      <div>
        <img src="https://redive.estertion.win/card/full/124131.webp" alt="Desktop hero" class="box-cover rounded-card" />
      </div>

      <div class="min-w-[355px] max-w-[375px] space-y-3">
        <Calendar class="box-cover rounded-card" />
        <Battery class="box-cover rounded-card" />
        <Weather class="box-cover rounded-card" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.desktop-container {
  background-color: #030923;
}

.desktop-background {
  @apply absolute left-0 top-0 h-full w-full opacity-50 blur-sm;
  background-image: url('https://redive.estertion.win/card/full/124131.webp');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
