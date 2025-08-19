<script setup lang="ts">
import { useWindowSize } from '@vant/use';
import { onMounted } from 'vue';
import SnapScroll from '~/components/shares/SnapScroll.vue';
import FirstLoad from './components/FirstLoad.vue';
import FirstSlide from './components/slides/FirstSlide.vue';
import LastSlide from './components/slides/LastSlide.vue';
import SecondSlide from './components/slides/SecondSlide.vue';
import ThirdSlide from './components/slides/ThirdSlide.vue';

const { width } = useWindowSize();

const scrollToRef = (id: string) => {
  const snap = document.getElementById('snap-scroll');
  const one = document.getElementById(id);
  if (snap && one) {
    const current = snap.scrollTop + one.offsetHeight;
    snap.scrollTo(0, current);
  }
};

const handleScroll = () => {
  if (width.value < 500) return;

  const snap = document.getElementById('snap-scroll');
  const last = snap?.children[snap.children.length - 1];
  const nextBtn = document.getElementById('next-button');

  if (!(snap && last && nextBtn)) return;

  if (
    !nextBtn.classList.contains('hide') &&
    snap.scrollHeight - last.scrollHeight * 2 + 100 <= snap.scrollTop
  ) {
    nextBtn.classList.add('hide');
  } else if (
    nextBtn.classList.contains('hide') &&
    snap.scrollHeight - last.scrollHeight * 2 + 100 > snap.scrollTop
  ) {
    nextBtn.classList.remove('hide');
  }

  // for make background image look animated
  const nodeList = document.querySelectorAll<HTMLElement>('.background-i');

  if (nodeList) {
    nodeList.forEach((node, index) => {
      node.style.backgroundPosition = `50% ${
        (node.scrollHeight - 800 * (2 - index) - snap.scrollTop) * 0.08
      }px`;
    });
  }

  // all child add show class
  for (let i = 0; i <= snap.children.length; i++) {
    if (snap.children[i]) {
      if (
        snap.scrollTop >= snap.children[i].scrollHeight * i &&
        snap.scrollTop <
          snap.children[i].scrollHeight * (i + 1) -
            snap.children[i].scrollHeight / 3
      ) {
        snap.children[i].classList.add('show');
      } else {
        snap.children[i].classList.remove('show');
      }
    }
    // snap.children[i].classList.add('show');
  }
};
</script>

<template>
  <div>
    <FirstLoad />
    <div class="fixed left-0 top-0 flex h-body w-full border border-red-500">
      <button
        id="next-button"
        class="absolute bottom-0 z-[100] hidden h-fit w-full justify-center p-2 md:flex"
        @click="scrollToRef(`section_${1}`)"
      >
        <div class="scroll-down duration-300 hover:scale-90 hover:opacity-70" />
      </button>

      <SnapScroll id="snap-scroll" fullscreen @scroll="handleScroll">
        <FirstSlide id="section_1" />
        <SecondSlide id="section_2" />
        <ThirdSlide id="section_3" />
        <LastSlide id="section_last" />
      </SnapScroll>
    </div>
  </div>
</template>
<style>
.hide {
  opacity: 0;
  pointer-events: none;
}

.scroll-down {
  width: 80px;
  height: 40px;
  background-image: url('@/assets/images/scroll-down.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 80px 40px;
}

.background-i {
  background-position-x: center;
}

@media (max-width: 768px) {
  .background-i {
    background-position: center center !important;
    background-size: auto var(--body-height, 100vh) !important;
  }
}
</style>
