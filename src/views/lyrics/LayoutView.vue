<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import router from '~/router';
import { usePlayer } from '~/stores/player';
import { usePlaylist } from '~/stores/playlist';
import { getLyricsList } from '~/services/lyrics';

const player = usePlayer();
const playlist = usePlaylist();
const currentRoute = useRoute();
const scrollContainerRef = ref<HTMLElement | null>(null);
type ScrollPosition = {
  top: number;
  anchorElement: HTMLElement | null;
  anchorOffset: number;
};

const scrollPositions = new Map<string, ScrollPosition>();
let scrollRestorationFrame: number | null = null;

const initPlaylist = async () => {
  const cachedLyrics = await getLyricsList(1, false, true);
  if (cachedLyrics.length <= (playlist.list?.items?.length ?? 0)) return;

  playlist.list = {
    id: 0,
    name: 'All Lyrics',
    description: 'Every song from the lyrics catalog',
    isPublic: false,
    items: cachedLyrics,
  };
};

onMounted(async () => {
  player.init('yt-player');

  const html = document.getElementById('anella-container');

  if (html) {
    html.style.overflow = 'hidden';
  }

  await playlist.getPlaylists();
  initPlaylist();
});

onUnmounted(() => {
  const html = document.getElementById('anella-container');

  if (html) {
    html.style.overflow = '';
  }
});

const menus = [
  { name: 'lyrics', label: 'Home', icon: '' },
  { name: 'lyrics-all', label: 'All Lyrics', icon: '' },
  { name: 'lyrics-mine', label: 'My Lyrics', icon: '', auth: true },
  { name: 'lyrics-add', label: 'Add Lyrics', icon: '', auth: true },
];

const cachedRouteNames = ['lyrics', 'lyrics-all'];

const onClickMenu = (name: string) => {
  router.push({ name });
};

const cancelScrollRestoration = () => {
  if (scrollRestorationFrame === null) return;
  window.cancelAnimationFrame(scrollRestorationFrame);
  scrollRestorationFrame = null;
};

const getScrollPosition = (scrollContainer: HTMLElement): ScrollPosition => {
  const containerBounds = scrollContainer.getBoundingClientRect();
  const anchorElement =
    Array.from(scrollContainer.querySelectorAll<HTMLElement>('[data-lyrics-scroll-anchor]')).find((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.bottom > containerBounds.top && bounds.top < containerBounds.bottom;
    }) ?? null;

  return {
    top: scrollContainer.scrollTop,
    anchorElement,
    anchorOffset: anchorElement ? anchorElement.getBoundingClientRect().top - containerBounds.top : 0,
  };
};

const restoreScrollPosition = (routeName: string, position: ScrollPosition) => {
  cancelScrollRestoration();

  let remainingFrames = 4;
  const restore = () => {
    const scrollContainer = scrollContainerRef.value;
    if (!scrollContainer || currentRoute.name !== routeName) {
      scrollRestorationFrame = null;
      return;
    }

    scrollContainer.scrollTop = position.top;

    if (position.anchorElement && scrollContainer.contains(position.anchorElement)) {
      const containerTop = scrollContainer.getBoundingClientRect().top;
      const currentAnchorOffset = position.anchorElement.getBoundingClientRect().top - containerTop;
      scrollContainer.scrollTop += currentAnchorOffset - position.anchorOffset;
    }

    remainingFrames -= 1;
    if (remainingFrames > 0) {
      scrollRestorationFrame = window.requestAnimationFrame(restore);
    } else {
      scrollRestorationFrame = null;
    }
  };

  restore();
};

watch(
  () => currentRoute.name,
  async (routeName, previousRouteName) => {
    cancelScrollRestoration();

    const scrollContainer = scrollContainerRef.value;
    const previousName = typeof previousRouteName === 'string' ? previousRouteName : '';

    if (scrollContainer && cachedRouteNames.includes(previousName)) {
      scrollPositions.set(previousName, getScrollPosition(scrollContainer));
    }

    await nextTick();

    if (!scrollContainer) return;

    const currentName = typeof routeName === 'string' ? routeName : '';
    if (cachedRouteNames.includes(currentName)) {
      const position = scrollPositions.get(currentName);
      if (position) {
        restoreScrollPosition(currentName, position);
      } else {
        scrollContainer.scrollTop = 0;
      }
      return;
    }

    if (currentName === 'lyrics-detail') {
      scrollContainer.scrollTop = 0;
    }
  },
);

onUnmounted(() => {
  cancelScrollRestoration();
});
</script>

<template>
  <div class="flex h-body w-full flex-col overflow-hidden">
    <div class="flex h-full w-full">
      <div class="hidden h-full w-[300px] border-r border-border bg-surface md:block">
        <button
          v-for="item in menus"
          :key="item.name"
          class="flex w-full items-center space-x-3 border-b border-border px-5 py-2 text-foreground"
          @click="onClickMenu(item.name)"
        >
          <div class="size-7 rounded bg-primary-soft"></div>
          <span class="text-primary"> {{ item.label }}</span>
        </button>
      </div>
      <div ref="scrollContainerRef" class="h-full w-full overflow-auto">
        <div class="mx-auto w-full max-w-[900px] pb-player">
          <RouterView v-slot="{ Component, route }">
            <KeepAlive>
              <component :is="Component" v-if="route.name && cachedRouteNames.includes(route.name.toString())" :key="route.name.toString()" />
            </KeepAlive>
            <component :is="Component" v-if="!route.name || !cachedRouteNames.includes(route.name.toString())" :key="route.fullPath" />
          </RouterView>
        </div>
      </div>
    </div>
  </div>

  <!-- <div class="h-[calc(var(--body-height))] overflow-hidden bg-blue-100 dark:bg-[#0c102f]" :style="{ '--nav-height': pxToRem(60) }">
    <CloudNavBar />
    <RouterView />
  </div> -->
</template>
