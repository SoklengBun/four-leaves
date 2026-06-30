<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue';

interface CustomInputAttributes extends /* @vue-ignore */ InputHTMLAttributes {
  label: string;
}

const value = defineModel<string>();
const props = defineProps<CustomInputAttributes>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <label class="pl-1 text-xs font-semibold text-foreground-muted">{{ props.label }}</label>
    <input
      class="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-foreground-muted focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_#f99ab833]"
      v-bind="$attrs"
      v-model="value"
    />
  </div>
</template>
