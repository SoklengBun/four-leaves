<script setup lang="ts">
import { onMounted } from 'vue';
import { createFireworks } from '~/plugins/firework';

onMounted(() => {
  createFireworks({
    selector: 'canvas.fireworks',
    circleRadius: { min: 5, max: 25 },
    diffuseRadius: { min: 10, max: 50 },
    orbitRadius: { min: 20, max: 30 },
    colors: ['#5ec7ff', '#fabee2', '#b561fa', '#76ff5e', '#fa6161'],
    orbitColor: '#5802ba',
    numberOfParticles: 10,
    animeDuration: { min: 500, max: 1000 },
  });
});
</script>
<template>
  <canvas class="fireworks" />
</template>

<style scoped>
canvas.fireworks {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10000;
  pointer-events: none;
}
</style>
