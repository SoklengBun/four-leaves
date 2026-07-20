<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import CloudNavBar from '~/components/layout/header/lyric/CloudNavBar.vue';
import router from '~/router';
import { pxToRem } from '~/utils/helper';
import { usePlayer } from '~/stores/player';
import { useAuth } from '~/stores/auth';
import { usePlaylist } from '~/stores/playlist';
import { getLyricsList } from '~/services/lyrics';

const player = usePlayer();
const playlist = usePlaylist();

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
