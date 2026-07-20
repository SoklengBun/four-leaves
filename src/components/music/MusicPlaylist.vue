<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import CustomPopup from '~/components/shares/CustomPopup.vue';
import { usePlayer } from '~/stores/player';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import { usePlaylist } from '~/stores/playlist';
import YoutubeThumbnail from './YoutubeThumbnail.vue';

const player = usePlayer();
const { current, videoId, showPlaylist } = storeToRefs(player);

const playlist = usePlaylist();

const playlistItems = computed(() => playlist.list?.items ?? []);
const currentPlaylistTitle = computed(() => playlist.list?.name || 'Soft Cloud Mix');
const currentPlaylistDescription = computed(() => playlist.list?.description || 'A fluffy little queue for your current listening session.');

const selectSong = (song: PlaylistItem) => {
  player.selectSong(song, undefined, playlist.list);
};

const closePlaylist = () => {
  showPlaylist.value = false;
};
</script>

<template>
  <CustomPopup
    v-if="playlist?.list?.items?.length"
    v-model:show="showPlaylist"
    desktop-position="right"
    mobile-position="right"
    eyebrow="Now playing"
    :title="currentPlaylistTitle"
    :description="currentPlaylistDescription"
    @close="closePlaylist"
  >
    <div class="flex h-full w-full flex-col overflow-hidden">
      <p class="mb-3 text-base font-semibold text-foreground md:text-lg">Playlist Queue</p>
      <div class="flex flex-1 flex-col overflow-auto overscroll-none px-1">
        <template v-for="song in playlistItems" :key="song.id">
          <button type="button" class="group relative flex shrink-0 items-center px-1 py-3" @click="selectSong(song)">
            <div class="size-10 shrink-0 overflow-hidden rounded-lg md:size-12">
              <YoutubeThumbnail :id="song.defaultCoverId || song.videoId" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col items-start px-2">
              <p class="w-full truncate text-left text-sm font-semibold text-foreground md:text-base" :title="getLyricsTitleLabel(song)">
                {{ getLyricsTitleLabel(song) }}
              </p>
              <p
                class="w-full truncate text-left text-xs text-foreground-muted md:text-sm"
                :title="getLyricsArtistsLabel(song.artists) || 'Unknown artist'"
              >
                {{ getLyricsArtistsLabel(song.artists) || 'Unknown artist' }}
              </p>
            </div>
            <div
              class="playlist-highligh absolute left-0 top-0 hidden size-full group-hover:!block"
              :class="{ '!block': song.id === current?.id || song.videoId === videoId }"
            ></div>
          </button>
          <div class="playlist-divider h-px w-full shrink-0 bg-border last:hidden"></div>
        </template>
      </div>
    </div>
  </CustomPopup>
</template>
<style scoped>
.playlist-divider {
  box-shadow: 0px 0px 3px #31018c74;
}
.dark .playlist-divider {
  box-shadow: 0px 0px 3px #0f3e71;
}

.playlist-highligh {
  background: linear-gradient(150deg, transparent 0%, transparent 10%, #b994ff33 50%, transparent 90%, transparent 100%);
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: highlight 1s ease-in-out infinite;
}

@keyframes highlight {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -100% 0;
  }
}
</style>
