<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import router from '~/router';
import { usePlayer } from '~/stores/player';
import { usePlaylist } from '~/stores/playlist';
import { getLyricsList } from '~/services/lyrics';
import IconAddLyrics from '~/components/icons/IconAddLyrics.vue';
import IconHome from '~/components/icons/IconHome.vue';
import IconLyricsLibrary from '~/components/icons/IconLyricsLibrary.vue';

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
  const requestedPlaylistId = Number(currentRoute.query.playlistId);
  if (Number.isSafeInteger(requestedPlaylistId) && requestedPlaylistId > 0) return;

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
  { name: 'lyrics', label: 'Home', description: 'Discover songs and playlists', icon: IconHome },
  { name: 'lyrics-all', label: 'All Lyrics', description: 'Browse the complete collection', icon: IconLyricsLibrary },
  { name: 'lyrics-add', label: 'Add Lyrics', description: 'Create a new lyric entry', icon: IconAddLyrics, auth: true },
];

const cachedRouteNames = ['lyrics', 'lyrics-all'];

const onClickMenu = (name: string) => {
  router.push({ name });
};

const isMenuActive = (name: string) => currentRoute.name === name;

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
      <aside
        class="relative hidden h-full w-[300px] shrink-0 overflow-hidden border-r border-border bg-gradient-to-b from-card via-surface to-background md:flex md:flex-col"
      >
        <div class="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-primary-soft opacity-70 blur-3xl" aria-hidden="true"></div>
        <div
          class="pointer-events-none absolute -bottom-24 -left-16 size-48 rounded-full bg-secondary-soft opacity-60 blur-3xl"
          aria-hidden="true"
        ></div>

        <div class="relative px-6 pb-5 pt-7">
          <div class="mb-3 flex items-center gap-2">
            <span class="h-px w-7 bg-primary"></span>
            <p class="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-primary">Your music</p>
          </div>
          <h2 class="text-2xl font-semibold tracking-tight text-foreground">Lyrics library</h2>
          <p class="mt-1 text-sm leading-5 text-foreground-muted">Everything you need to enjoy and manage your collection.</p>
        </div>

        <nav class="relative flex flex-col gap-2 px-3" aria-label="Lyrics navigation">
          <button
            v-for="item in menus"
            :key="item.name"
            type="button"
            class="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98]"
            :class="
              isMenuActive(item.name)
                ? 'border-border-strong bg-card shadow-card'
                : 'border-transparent text-foreground-muted hover:translate-x-1 hover:border-border hover:bg-card-hover'
            "
            :aria-current="isMenuActive(item.name) ? 'page' : undefined"
            @click="onClickMenu(item.name)"
          >
            <span
              class="absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary transition-opacity"
              :class="isMenuActive(item.name) ? 'opacity-100' : 'opacity-0'"
              aria-hidden="true"
            ></span>
            <span
              class="flex size-11 shrink-0 items-center justify-center rounded-xl border transition-[background-color,border-color,color,transform] duration-200 group-hover:scale-105"
              :class="
                isMenuActive(item.name)
                  ? 'border-primary bg-primary text-primary-foreground shadow-primary'
                  : 'border-border bg-primary-soft text-primary group-hover:border-primary'
              "
            >
              <component :is="item.icon" class="size-[1.35rem]" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-bold" :class="isMenuActive(item.name) ? 'text-primary' : 'text-foreground'">
                {{ item.label }}
              </span>
              <span class="mt-0.5 block truncate text-xs text-foreground-muted">{{ item.description }}</span>
            </span>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              class="size-4 shrink-0 text-foreground-subtle transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            >
              <path d="m7.5 4.5 5 5.5-5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </nav>

        <div class="relative mt-auto px-6 pb-6">
          <div class="h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"></div>
          <p class="mt-4 text-center text-[0.68rem] font-medium uppercase tracking-[0.18em] text-foreground-subtle">Made for listening</p>
        </div>
      </aside>
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
