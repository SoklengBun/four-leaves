<script setup lang="ts">
import { InputHTMLAttributes, computed } from 'vue';

interface CustomInputAttributes extends InputHTMLAttributes {
  label: string;
  modelValue: string;
}

const props = defineProps<CustomInputAttributes>();

const emit = defineEmits(['update:modelValue']);
const value = computed<string>({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
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
