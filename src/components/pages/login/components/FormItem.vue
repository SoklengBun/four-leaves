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
    <label class="text-foreground-muted pl-1 text-xs font-semibold">{{ props.label }}</label>
    <input
      class="border-border bg-surface placeholder:text-foreground-muted w-full rounded-full border px-4 py-2 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_#f99ab833] dark:focus:shadow-[0_0_0_3px_#f99ab855]"
      v-bind="$attrs"
      v-model="value"
    />
  </div>
</template>
