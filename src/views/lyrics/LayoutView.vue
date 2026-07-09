<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import CloudNavBar from '~/components/layout/header/lyric/CloudNavBar.vue';
import router from '~/router';
import { pxToRem } from '~/utils/helper';
import { usePlayer } from '~/stores/player';
import { useAuth } from '~/stores/auth';
import { usePlaylist } from '~/stores/playlist';

const player = usePlayer();
const playlist = usePlaylist();

onMounted(async () => {
  player.init('yt-player');

  const html = document.getElementById('anella-container');

  if (html) {
    html.style.overflow = 'hidden';
  }

  await playlist.getPlaylists();
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
</script>

<template>
  <div class="flex h-body w-full flex-col overflow-hidden">
    <div class="flex h-full w-full">
      <div class="hidden h-full w-[300px] bg-red-50 md:block">
        <button v-for="item in menus" :key="item.name" class="flex w-full items-center space-x-3 border-b px-5 py-2" @click="onClickMenu(item.name)">
          <div class="size-7 rounded bg-red-300"></div>
          <span class="text-anella-dark-lavender"> {{ item.label }}</span>
        </button>
      </div>
      <div class="h-full w-full overflow-auto">
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
