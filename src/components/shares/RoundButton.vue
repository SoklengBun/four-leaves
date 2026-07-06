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
    class="fixed right-3 top-3 z-20 mr-auto flex size-[40px] shrink-0 items-center justify-center rounded-full border-2 border-[#ffcfe7] bg-[linear-gradient(160deg,#fff9fd_0%,#ffeaf5_100%)] text-[#ff4f9b] shadow-[0_4px_10px_#ffd9ec,inset_0_0_0_4px_#fff4fb] transition-[transform,box-shadow] duration-150 active:scale-95 active:shadow-[0_2px_8px_#ffd2e8,inset_0_0_0_4px_#ffeef8]"
    @click="onClick"
  >
    <span
      class="relative inline-flex h-[18px] w-[18px] text-[#ff4f9b] after:absolute after:-right-1 after:-top-0.5 after:h-[6px] after:w-[6px] after:rounded-full after:bg-white after:shadow-[0_0_0_1px_#ffd2ea,0_0_6px_#fff7fc] after:content-['']"
      aria-hidden="true"
    >
      <slot>
        <MoreIcon />
      </slot>
    </span>
  </button>
</template>
