<script setup lang="ts">
import { toRefs } from 'vue';
import { toasts, removeToast } from '~/utils/toast';

const { list } = toRefs({ list: toasts });
</script>

<template>
  <div
    class="fixed right-4 top-4 z-[9999] flex flex-col items-end gap-2 max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2 max-sm:items-center"
    aria-live="polite"
    aria-atomic="true"
  >
    <transition-group
      tag="div"
      class="flex flex-col items-end gap-2 max-sm:items-center"
      enter-active-class="transition-[transform,opacity] duration-[220ms] ease-in-out"
      leave-active-class="transition-[transform,opacity] duration-[220ms] ease-in-out"
      enter-from-class="translate-x-full opacity-0 max-sm:translate-x-0 max-sm:-translate-y-full"
      enter-to-class="translate-x-0 opacity-100"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0 max-sm:translate-x-0 max-sm:-translate-y-full"
    >
      <div
        v-for="t in list"
        :key="t.id"
        class="flex min-w-[200px] max-w-[360px] cursor-pointer items-center gap-3 overflow-hidden rounded-lg px-[0.8rem] py-[0.6rem] text-primary-foreground shadow-card data-[type=error]:bg-danger data-[type=normal]:bg-surface-hover data-[type=success]:bg-success data-[type=warning]:bg-warning"
        :data-type="t.type"
        @click="removeToast(t.id)"
      >
        <div class="flex-1 text-[0.95rem]">{{ t.message }}</div>
        <button class="cursor-pointer border-none bg-transparent font-semibold text-primary-foreground" @click.stop="removeToast(t.id)">✕</button>
      </div>
    </transition-group>
  </div>
</template>
