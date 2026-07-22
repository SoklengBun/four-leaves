<script setup lang="ts">
import { getRadomPosition, getRandom } from '~/utils/helper';
</script>

<template>
  <div class="floating-star pointer-events-none absolute left-1/2 top-1/2 -z-[1] -translate-x-1/2 -translate-y-1/2">
    <div
      v-for="star in 10"
      :key="star"
      :style="[
        `--destination: ${getRadomPosition(0, 50)}vh ${getRadomPosition(0, 50)}vh`,
        `--star-size: ${getRandom(2, 10)}px`,
        { animationDelay: 1000 * star + 'ms' },
      ]"
      class="star-wrapper pointer-events-none absolute left-1/2 top-1/2 -z-[1] h-[var(--star-size,15px)] w-[var(--star-size,15px)] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_10px_#fbeb94]"
    >
      <div class="star size-full bg-[#fafbbb]"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.floating-star {
  animation: spin 100s infinite;
}

.star-wrapper {
  animation: floating 3s linear infinite;

  .delay {
    animation-delay: 2.5s;
  }
  .star {
    clip-path: polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%);
    animation: spin 3s linear infinite;
  }
}

@keyframes floating {
  from {
    translate: 0% 0%;
  }

  to {
    translate: var(--destination);
    opacity: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
