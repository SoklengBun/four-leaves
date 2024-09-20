<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue';

interface CustomInputAttributes extends /* @vue-ignore */ InputHTMLAttributes {
  label: string;
}

const value = defineModel<string>();
const props = defineProps<CustomInputAttributes>();
</script>

<template>
  <div class="flex flex-col">
    <span>{{ props.label }}</span>
    <input v-bind="$attrs" v-model="value" />
  </div>
</template>

<style scoped>
input {
  background-color: transparent;
  border: 1px solid var(--text-color);
  border-radius: 3px;
  padding: 2px 10px;
}
</style>
