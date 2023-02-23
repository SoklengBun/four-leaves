<script setup lang="ts"></script>
<template>
  <section class="item h-screen overflow-hidden">
    <div id="my-id" class="background-i first-slide flex h-full w-full">
      <div class="relative h-full w-1/2">
        <div class="slide-left absolute bottom-0 left-0 w-full bg-black p-5">
          hey
        </div>
      </div>
      <div class="relative h-full w-1/2">
        <div class="slide-right absolute bottom-0 right-0 w-full p-5">
          heyaa
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.background-i.first-slide {
  background-image: url('https://redive.estertion.win/card/full/124131.webp');
  background-repeat: no-repeat;
  background-size: auto 120vh;
  opacity: 0.5;
}
@media (min-width: 700px) {
  .slide-right {
    transition: transform 330ms;
    transition-timing-function: ease-in-out;
    transform: translate3d(100%, 0, 0);
  }

  .slide-left {
    transition: transform 330ms;
    transition-timing-function: ease-in-out;
    transform: translate3d(-100%, 0, 0);
  }

  .show .slide-left {
    transform: translate3d(0, 0, 0);
  }
}
</style>
