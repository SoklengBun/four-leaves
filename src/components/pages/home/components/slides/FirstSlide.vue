<script setup lang="ts"></script>
<template>
  <section class="item relative h-screen overflow-hidden">
    <div class="background-i first-slide absolute top-0 h-full w-full" />
    <div id="my-id" class="flex h-full w-full flex-col md:flex-row">
      <div class="relative w-full flex-1 !opacity-100 md:h-full md:w-1/2">
        <div class="slide-left absolute bottom-0 left-0 w-full bg-black p-5">
          hey
        </div>
      </div>
      <div class="relative w-full flex-1 md:h-full md:w-1/2">
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

@media (min-width: 768px) {
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
  .show .slide-right {
    transform: translate3d(0, 0, 0);
  }
}
</style>
