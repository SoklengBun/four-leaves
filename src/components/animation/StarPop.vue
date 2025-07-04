<script setup lang="ts">
import { getRadomPosition, getRandom } from '~/utils/helper';
</script>
<template>
  <div
    v-for="star in 25"
    :key="star"
    :style="[
      `--destination: ${getRadomPosition(0, 50)}vh ${getRadomPosition(
        0,
        50,
      )}vh`,
      `--star-size: ${getRandom(10, 30)}px`,
    ]"
    class="star-wrapper"
  >
    <div class="star"></div>
  </div>
</template>

<style scoped lang="scss">
.star-wrapper {
  width: var(--star-size, 15px);
  height: var(--star-size, 15px);
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: -1;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0px 0px 10px #fbeb94);
  animation: floating 2s linear forwards;
  pointer-events: none;

  .star {
    width: 100%;
    height: 100%;
    background: #fafbbb;
    clip-path: polygon(
      50% 0%,
      65% 35%,
      100% 50%,
      65% 65%,
      50% 100%,
      35% 65%,
      0% 50%,
      35% 35%
    );
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
