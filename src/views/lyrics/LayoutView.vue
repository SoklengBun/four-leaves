<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import CloudNavBar from '~/components/layout/header/lyric/CloudNavBar.vue';
import router from '~/router';
import { pxToRem } from '~/utils/helper';
import { usePlayer } from '~/stores/player';
import { useAuth } from '~/stores/auth';
import { usePlaylistStore } from '~/stores/usePlaylistStore';

const player = usePlayer();
const auth = useAuth();
const playlistStore = usePlaylistStore();

onMounted(() => {
  player.init('yt-player');

  const html = document.getElementById('anella-container');

  if (html) {
    html.style.overflow = 'hidden';
  }
});

watch(
  () => auth.user?.id ?? null,
  async (userId) => {
    if (!auth.isLoggedIn || !userId) {
      playlistStore.clearPlaylists();
      return;
    }

    await playlistStore.fetchMine();
  },
  { immediate: true },
);

onUnmounted(() => {
  const html = document.getElementById('anella-container');

  if (html) {
    html.style.overflow = '';
  }
});

const menus = [
  { name: 'lyrics', label: 'Home', icon: '' },
  { name: 'lyrics-mine', label: 'My Lyrics', icon: '', auth: true },
  { name: 'lyrics-add', label: 'Add Lyrics', icon: '', auth: true },
];
</script>

<template>
  <div class="flex h-body w-full flex-col overflow-hidden">
    <div class="flex h-full w-full">
      <div class="hidden h-full w-[300px] bg-red-50 md:block">
        <button v-for="item in menus" :key="item.name" class="flex w-full items-center space-x-3 border-b px-5 py-2">
          <div class="size-7 rounded bg-red-300"></div>
          <span class="text-anella-dark-lavender"> {{ item.label }}</span>
        </button>
      </div>
      <div class="h-full w-full overflow-auto">
        <div class="mx-auto w-full max-w-[900px] pb-player">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="h-[calc(var(--body-height))] overflow-hidden bg-blue-100 dark:bg-[#0c102f]" :style="{ '--nav-height': pxToRem(60) }">
    <CloudNavBar />
    <RouterView />
  </div> -->
</template>
