<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    text?: string | null;
    gap?: number;
    speed?: number;
  }>(),
  {
    text: '',
    gap: 24,
    speed: 40,
  },
);

const containerRef = ref<HTMLElement | null>(null);
const measureRef = ref<HTMLElement | null>(null);
const isOverflowing = ref(false);
const distance = ref(0);
const duration = ref('0s');

let resizeObserver: ResizeObserver | null = null;

const trackStyle = computed(() => ({
  '--marquee-distance': `${distance.value}px`,
  '--marquee-duration': duration.value,
  columnGap: `${props.gap}px`,
}));

const updateMeasurement = async () => {
  await nextTick();

  const container = containerRef.value;
  const measure = measureRef.value;
  const text = props.text?.trim() ?? '';

  if (!container || !measure || !text) {
    isOverflowing.value = false;
    distance.value = 0;
    duration.value = '0s';
    return;
  }

  const containerWidth = container.clientWidth;
  const contentWidth = measure.scrollWidth;

  isOverflowing.value = contentWidth > containerWidth + 1;
  distance.value = contentWidth + props.gap;
  duration.value = `${Math.max(distance.value / props.speed, 8)}s`;
};

const bindObserver = async () => {
  await nextTick();

  resizeObserver?.disconnect();

  if (typeof ResizeObserver === 'undefined') {
    return;
  }

  resizeObserver = new ResizeObserver(() => {
    void updateMeasurement();
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }

  if (measureRef.value) {
    resizeObserver.observe(measureRef.value);
  }
};

watch(
  () => props.text,
  () => {
    void bindObserver();
    void updateMeasurement();
  },
);

watch(
  () => props.gap,
  () => {
    void updateMeasurement();
  },
);

watch(
  () => props.speed,
  () => {
    void updateMeasurement();
  },
);

onMounted(() => {
  void bindObserver();
  void updateMeasurement();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div ref="containerRef" class="marquee-text min-w-0 overflow-hidden">
    <span ref="measureRef" class="marquee-text__measure">{{ text }}</span>

    <p v-if="!isOverflowing" class="truncate whitespace-nowrap">
      {{ text }}
    </p>

    <div v-else class="overflow-hidden">
      <div class="marquee-text__track" :style="trackStyle">
        <p class="shrink-0 whitespace-nowrap">
          {{ text }}
        </p>
        <p aria-hidden="true" class="shrink-0 whitespace-nowrap">
          {{ text }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee-text {
  position: relative;
}

.marquee-text__measure {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  white-space: nowrap;
}

.marquee-text__track {
  display: flex;
  width: max-content;
  min-width: 100%;
  align-items: center;
  animation: marquee-text-scroll var(--marquee-duration) linear infinite;
  will-change: transform;
}

@keyframes marquee-text-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(calc(-1 * var(--marquee-distance)));
  }
}
</style>
