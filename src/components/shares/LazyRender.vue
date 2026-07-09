<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    tag?: string;
    rootMargin?: string;
  }>(),
  {
    tag: 'div',
    rootMargin: '300px 0px',
  },
);

const containerRef = ref<HTMLElement | null>(null);
const shouldRender = ref(false);

let observer: IntersectionObserver | null = null;

const renderNow = () => {
  shouldRender.value = true;
  observer?.disconnect();
  observer = null;
};

const observeVisibility = () => {
  if (shouldRender.value) return;

  if (!containerRef.value || typeof IntersectionObserver === 'undefined') {
    renderNow();
    return;
  }

  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      renderNow();
    },
    {
      rootMargin: props.rootMargin,
    },
  );

  observer.observe(containerRef.value);
};

onMounted(() => {
  observeVisibility();
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <component :is="tag" ref="containerRef">
    <slot v-if="shouldRender" />
    <slot v-else name="placeholder" />
  </component>
</template>
