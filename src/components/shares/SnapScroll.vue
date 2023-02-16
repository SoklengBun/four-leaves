<script setup lang="ts">
defineProps<{ fullscreen: boolean; horizontal: boolean }>();
</script>

<template>
  <div
    class="scroll-snap-container w-screen h-screen"
    :class="{ fullscreen: fullscreen, horizontal: horizontal }"
  >
    <slot> </slot>
  </div>
</template>

<style>
.scroll-snap-container {
  display: block;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-points-y: repeat(100%);
  scroll-snap-destination: 0 0;
  scroll-snap-type: y mandatory;
  scroll-snap-type: mandatory;
  scroll-behavior: smooth;
}
.scroll-snap-container.horizontal {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-y: hidden;
  overflow-x: scroll;
  scroll-snap-points-x: repeat(100%);
  scroll-snap-type: x mandatory;
}
.scroll-snap-container.fullscreen {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  min-width: 100%;
  min-height: 100%;
}
.scroll-snap-container.fullscreen.horizontal {
  flex-direction: row;
}
.item {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
.scroll-snap-container.fullscreen > .item {
  scroll-snap-stop: always;
  min-height: 100%;
  flex: 1;
}
.scroll-snap-container.horizontal > .item {
  scroll-snap-align: center;
  scroll-snap-stop: always;
}
.scroll-snap-container.fullscreen.horizontal > .item {
  scroll-snap-align: center;
  scroll-snap-stop: always;
  min-width: 100%;
  flex: 1;
}

::-webkit-scrollbar {
  width: 0px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
