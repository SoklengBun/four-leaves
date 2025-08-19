<script setup lang="ts">
import { useDark } from '@vueuse/core';
import { ref, onMounted } from 'vue';

const isDark = useDark();

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

function animateBack() {
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

  if (
    Math.abs(positionY) > 0.5 ||
    Math.abs(velocityY) > 0.5 ||
    Math.abs(angle) > 0.01
  ) {
    animationFrame = requestAnimationFrame(animateBack);
  } else {
    knobTransform.value = 'translateY(0) rotate(0)';
    ropeTransform.value = 'scaleY(1) rotate(0)';
    offsetY.value = 0;
  }
}

onMounted(() => {
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointermove', onPointerMove);
});
</script>

<template>
  <div class="fixed -top-5 right-1">
    <div class="lamp">
      <div class="rope" :style="{ transform: ropeTransform }"></div>
      <div
        class="knob"
        :style="{ transform: knobTransform }"
        @pointerdown="onPointerDown"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.lamp {
  position: relative;
  width: 40px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rope {
  width: 3px;
  height: 100px;
  background: #b07d4f;
  border-radius: 2px;
  transform-origin: top center;
}

.knob {
  width: 24px;
  height: 24px;
  background: #1b73f7;
  border-radius: 50%;
  margin-top: -8px;
  cursor: grab;
  touch-action: none;
}
.knob:active {
  cursor: grabbing;
  background: #448fff;
}
</style>
