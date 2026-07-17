<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { needRefresh, updateServiceWorker } = useRegisterSW();

const close = () => {
  needRefresh.value = false;
};
</script>

<template>
  <div
    class="pwa-toast"
    :class="needRefresh ? 'opacity-100' : '-translate-y-44 opacity-0'"
  >
    <div>
      {{ $t('pwa.update_available_message') }}
    </div>
    <button class="button refresh" @click="updateServiceWorker()">
      {{ $t('pwa.update') }}
    </button>
    <button class="button close" @click="close">
      {{ $t('pwa.close') }}
    </button>
  </div>
</template>

<style lang="scss">
.pwa-toast {
  @apply fixed left-1/2 top-5 z-[2000] h-fit w-fit -translate-x-1/2 rounded border border-border bg-card px-5 py-2.5 text-foreground shadow-card transition-all md:bottom-5 md:left-auto md:right-5 md:top-auto md:translate-x-0;

  .button {
    @apply mt-2 rounded border px-2 py-0.5;
  }

  .refresh {
    @apply mr-2 bg-success text-primary-foreground;
  }

  .close {
    @apply border-border-strong text-foreground-muted;
  }
}
</style>
