<script setup lang="ts">
defineProps<{ variant: 'primary' | 'secondary' }>();

const classa = {
  primary: 'text-blue-500',
  secondary: 'text-red-500',
};
</script>

<template>
  <button :class="classa[variant]">
    <slot></slot>
  </button>
</template>
