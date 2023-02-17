<script setup lang="ts">
import FooterBar from '~/components/FooterBar.vue';
import SnapScroll from '~/components/shares/SnapScroll.vue';
import { t } from '~/locales';
import FirstLoad from './components/FirstLoad.vue';
import FirstSlide from './components/slides/FirstSlide.vue';

const scrollToRef = (id: string) => {
  const snap = document.getElementById('snap-scroll');
  const one = document.getElementById(id);
  if (snap && one) {
    const current = snap.scrollTop + one.offsetHeight;
    snap.scrollTo(0, current);
  }
};

const handleScroll = () => {
  const snap = document.getElementById('snap-scroll');
  const last = document.getElementById('section_3'); //Last child id
  const nextBtn = document.getElementById('next-button');

  if (!(snap && last && nextBtn)) return;

  if (
    !nextBtn.classList.contains('hide') &&
    snap.scrollTop - last.offsetHeight >= snap.offsetHeight + 100
  ) {
    nextBtn.classList.add('hide');
  } else if (
    nextBtn.classList.contains('hide') &&
    snap.scrollTop - last.offsetHeight <= snap.offsetHeight + 100
  ) {
    nextBtn.classList.remove('hide');
  }
};
</script>

<template>
  <div>
    <FirstLoad />
    <div class="fixed top-0 flex h-screen w-full bg-green-400">
      <div
        id="next-button"
        class="absolute bottom-0 z-100 hidden h-fit w-full justify-center md:flex"
        :class="{ hidden: false }"
      >
        <button @click="scrollToRef(`section_${0}`)">
          {{ t("button['next']") }}
        </button>
      </div>
      <SnapScroll
        id="snap-scroll"
        :fullscreen="true"
        :horizontal="false"
        @scroll="handleScroll"
      >
        <FirstSlide id="section_0" />
        <div id="section_1" class="item h-screen bg-green-100 dark:bg-black/20">
          b
        </div>
        <div id="section_2" class="item h-screen bg-blue-100 dark:bg-black/30">
          c
        </div>
        <div
          id="section_3"
          class="item flex h-screen w-full items-end justify-end bg-yellow-100 dark:bg-black/40"
        >
          <FooterBar />
        </div>
      </SnapScroll>
    </div>
  </div>
</template>
<style>
.hide {
  opacity: 0;
  pointer-events: none;
}
</style>
