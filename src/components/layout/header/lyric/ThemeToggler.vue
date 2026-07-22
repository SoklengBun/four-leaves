<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppTheme } from '~/composables/useAppTheme';

const isDark = useAppTheme();

const pulling = ref(false);
const startY = ref(0);
const offsetY = ref(0);

const maxPull = 40;

let animationFrame: any;
let velocityY = 0;
let positionY = 0;
let angle = 0;
let velocityAngle = 0;

const knobTransform = ref('translateY(0)');
const ropeTransform = ref('scaleY(1)');

const onPointerDown = (e: any) => {
  pulling.value = true;
  startY.value = e.clientY || e.touches?.[0].clientY;
  cancelAnimationFrame(animationFrame);
};

const onPointerMove = (e: any) => {
  if (!pulling.value) return;
  const currentY = e.clientY || e.touches?.[0].clientY;
  let dy = currentY - startY.value;
  if (dy < 0) dy = 0;
  if (dy > maxPull) dy = maxPull;
  offsetY.value = dy;

  // while dragging: extend rope + move knob
  knobTransform.value = `translateY(${dy}px)`;
  ropeTransform.value = `scaleY(${1 + dy / 120})`;
};

const onPointerUp = () => {
  if (!pulling.value) return;
  pulling.value = false;

  // init spring
  positionY = offsetY.value;
  velocityY = -2;
  angle = 0.3;
  velocityAngle = 0;
  animateBack();
  isDark.value = !isDark.value;
};

const animateBack = () => {
  const stiffness = 0.1;
  const damping = 0.85;

  // vertical spring
  const forceY = -stiffness * positionY;
  velocityY += forceY;
  velocityY *= damping;
  positionY += velocityY;

  // horizontal sway
  const forceAngle = -0.05 * angle;
  velocityAngle += forceAngle;
  velocityAngle *= 0.92;
  angle += velocityAngle;

  // update transforms
  knobTransform.value = `translateY(${positionY}px) rotate(${angle}rad)`;
  ropeTransform.value = `scaleY(${1 + positionY / 120}) rotate(${angle / 3}rad)`;

  if (Math.abs(positionY) > 0.5 || Math.abs(velocityY) > 0.5 || Math.abs(angle) > 0.01) {
    animationFrame = requestAnimationFrame(animateBack);
  } else {
    knobTransform.value = 'translateY(0) rotate(0)';
    ropeTransform.value = 'scaleY(1) rotate(0)';
    offsetY.value = 0;
  }
};

onMounted(() => {
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointermove', onPointerMove);
});
</script>

<template>
  <div class="fixed -top-5 right-1">
    <div class="relative flex h-[220px] w-10 flex-col items-center">
      <div class="h-[100px] w-[3px] origin-top rounded-sm bg-[#b07d4f]" :style="{ transform: ropeTransform }"></div>
      <div
        class="-mt-2 size-6 cursor-grab touch-none rounded-full bg-[#1b73f7] active:cursor-grabbing active:bg-[#448fff]"
        :style="{ transform: knobTransform }"
        @pointerdown="onPointerDown"
      ></div>
    </div>
  </div>
</template>
