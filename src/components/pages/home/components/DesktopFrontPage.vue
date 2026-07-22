<script setup lang="ts">
import Battery from './Battery.vue';
import Calendar from './Calendar.vue';
import Weather from './Weather.vue';
</script>

<template>
  <div class="hidden h-body w-full overflow-y-auto overflow-x-hidden overscroll-none bg-background p-5 md:block">
    <div
      class="absolute left-0 top-0 size-full bg-[url('https://redive.estertion.win/card/full/124131.webp')] bg-cover bg-center bg-no-repeat opacity-50 blur-sm"
    />

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
