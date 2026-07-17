<script setup lang="ts">
defineProps<{ variant: 'primary' | 'secondary' }>();

const classa = {
  primary: 'text-primary',
  secondary: 'text-danger',
};
</script>

<template>
  <button :class="classa[variant]">
    <slot></slot>
  </button>
</template>
