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
    animeDuration: { min: 1000, max: 1500 },
    scale: 3,
  });
});
</script>
<template>
  <canvas class="fireworks pointer-events-none fixed left-0 top-0 z-[10000]" />
</template>
