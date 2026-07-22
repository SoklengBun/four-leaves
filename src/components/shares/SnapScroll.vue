<script setup lang="ts">
defineProps<{ fullscreen?: boolean; horizontal?: boolean }>();
</script>

<template>
  <div
    class="w-screen overflow-auto md:scroll-smooth md:[-webkit-overflow-scrolling:touch] md:[scroll-snap-destination:0_0] [&::-webkit-scrollbar]:w-0 md:[&_.item]:[scroll-snap-align:start] md:[&_.item]:[scroll-snap-stop:always]"
    :class="[
      horizontal
        ? 'md:flex md:flex-row md:flex-nowrap md:overflow-y-hidden md:overflow-x-scroll md:[scroll-snap-points-x:repeat(100%)] md:[scroll-snap-type:x_mandatory] md:[&>.item]:[scroll-snap-align:center]'
        : 'md:block md:overflow-x-hidden md:overflow-y-scroll md:[scroll-snap-points-y:repeat(100%)] md:[scroll-snap-type:y_mandatory]',
      fullscreen &&
        'md:absolute md:inset-0 md:flex md:min-h-full md:min-w-full md:flex-nowrap md:items-stretch md:justify-start md:[&>.item]:min-h-full md:[&>.item]:flex-1',
      fullscreen && !horizontal && 'md:flex-col',
      fullscreen && horizontal && 'md:[&>.item]:min-w-full',
    ]"
  >
    <slot> </slot>
  </div>
</template>

<style>
/* Track */
::-webkit-scrollbar-track {
  background: var(--color-surface);
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: var(--color-foreground-subtle);
}
</style>
