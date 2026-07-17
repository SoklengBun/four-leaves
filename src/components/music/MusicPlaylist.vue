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
      <div class="flex flex-1 flex-col gap-2 overflow-auto overscroll-none">
        <!-- <div class="overflow-auto"> -->
        <button
          v-for="song in playlistItems"
          :key="song.id"
          type="button"
          class="flex shrink-0 items-center rounded-xl border border-border bg-card p-2 shadow-sm transition-colors duration-200 hover:bg-card-hover"
          :class="{ '!border-border-strong !bg-primary-soft shadow-none': song.id === current?.id || song.videoId === videoId }"
          @click="selectSong(song)"
        >
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
        </button>
        <!-- </div> -->
      </div>
    </div>
  </CustomPopup>
</template>
