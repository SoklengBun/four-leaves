<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import CustomPopup from '~/components/shares/CustomPopup.vue';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { usePlayer } from '~/stores/player';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import { useRouter } from 'vue-router';
import { usePlaylist } from '~/stores/playlist';
import YoutubeThumbnail from './YoutubeThumbnail.vue';

const router = useRouter();
const player = usePlayer();
const { current, videoId, isPlaying, showPlaylist } = storeToRefs(player);

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
      <p class="mb-3 text-base font-semibold text-[#d785cc] md:text-lg">Playlist Queue</p>
      <div class="flex flex-1 flex-col gap-2 overflow-auto overscroll-none">
        <!-- <div class="overflow-auto"> -->
        <button
          v-for="(song, index) in playlistItems"
          :key="song.id"
          type="button"
          class="rounded-card flex shrink-0 items-center border border-primary bg-white p-2 shadow-md transition-all duration-500 md:border-2"
          :class="{ '!bg-pink-200 shadow-pink-300': song.id === current?.id || song.videoId === videoId }"
          @click="selectSong(song)"
        >
          <div class="rounded-card size-10 shrink-0 overflow-hidden md:size-12">
            <YoutubeThumbnail :id="song.defaultCoverId || song.videoId" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col items-start px-2">
            <MarqueeText :text="getLyricsTitleLabel(song)" class="w-full min-w-0 text-left text-sm font-semibold md:text-base" :gap="28" />
            <MarqueeText
              :text="getLyricsArtistsLabel(song.artists) || 'Unknown artist'"
              class="w-full min-w-0 text-left text-xs md:text-sm"
              :gap="24"
              :speed="32"
            />
          </div>
        </button>
        <!-- </div> -->
      </div>
    </div>
  </CustomPopup>
</template>
