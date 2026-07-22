<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { needRefresh, updateServiceWorker } = useRegisterSW();

const close = () => {
  needRefresh.value = false;
};
</script>

<template>
  <div
    class="fixed left-1/2 top-5 z-[2000] h-fit w-fit -translate-x-1/2 rounded border border-border bg-card px-5 py-2.5 text-foreground shadow-card transition-all md:bottom-5 md:left-auto md:right-5 md:top-auto md:translate-x-0"
    :class="needRefresh ? 'opacity-100' : '-translate-y-44 opacity-0'"
  >
    <div>
      {{ $t('pwa.update_available_message') }}
    </div>
    <button class="mr-2 mt-2 rounded border bg-success px-2 py-0.5 text-primary-foreground" @click="updateServiceWorker()">
      {{ $t('pwa.update') }}
    </button>
    <button class="mt-2 rounded border border-border-strong px-2 py-0.5 text-foreground-muted" @click="close">
      {{ $t('pwa.close') }}
    </button>
  </div>
</template>
