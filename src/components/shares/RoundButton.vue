<script setup lang="ts">
import MoreIcon from '~/components/shares/MoreIcon.vue';

const emit = defineEmits<{ click: [] }>();

const onClick = () => {
  emit('click');
};
</script>

<template>
  <button
    type="button"
    class="fixed right-3 top-3 z-20 mr-auto flex size-[40px] shrink-0 items-center justify-center rounded-full border-2 border-border-strong bg-surface text-primary shadow-primary transition-[transform,box-shadow] duration-150 active:scale-95"
    @click="onClick"
  >
    <span
      class="relative inline-flex h-[18px] w-[18px] text-primary after:absolute after:-right-1 after:-top-0.5 after:h-[6px] after:w-[6px] after:rounded-full after:bg-primary after:content-['']"
      aria-hidden="true"
    >
      <slot>
        <MoreIcon />
      </slot>
    </span>
  </button>
</template>
