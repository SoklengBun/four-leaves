<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { VueDraggable } from 'vue-draggable-plus';
import CustomPopup from '~/components/shares/CustomPopup.vue';
import { useAuth } from '~/stores/auth';
import { usePlayer } from '~/stores/player';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import { usePlaylist } from '~/stores/playlist';
import { UserRole } from '~/types/user';
import YoutubeThumbnail from './YoutubeThumbnail.vue';

const auth = useAuth();

const player = usePlayer();
const { current, videoId, showPlaylist } = storeToRefs(player);

const playlist = usePlaylist();
const originalOrder = ref<{ playlistId: number; itemIds: number[] } | null>(null);

const playlistItems = computed({
  get: () => playlist.list?.items ?? [],
  set: (items: PlaylistItem[]) => playlist.setItemsOrder(items),
});
const currentPlaylistTitle = computed(() => playlist.list?.name || 'Soft Cloud Mix');
const currentPlaylistDescription = computed(() => playlist.list?.description || 'A fluffy little queue for your current listening session.');

const selectSong = (song: PlaylistItem) => {
  player.selectSong(song, undefined, playlist.list);
};

const getPlaylistItemIds = (items: PlaylistItem[]) => {
  const itemIds: number[] = [];

  for (const item of items) {
    if (item.playlistItemId === undefined) return null;
    itemIds.push(item.playlistItemId);
  }

  return itemIds;
};

const checkPlaylistOrderChange = async (originalItemIds: number[]) => {
  const currentPlaylist = playlist.list;
  if (!currentPlaylist || currentPlaylist.id === 0 || !auth.isLoggedIn || !auth.user) return;

  const canReorder = currentPlaylist.createdById === auth.user.id || auth.user.role === UserRole.ADMIN;
  if (!canReorder) return;

  const currentItemIds = getPlaylistItemIds(currentPlaylist.items);
  if (!currentItemIds) return;

  const hasOrderChanged =
    originalItemIds.length === currentItemIds.length && currentItemIds.some((itemId, index) => itemId !== originalItemIds[index]);

  if (!hasOrderChanged) return;

  const payload = {
    itemOrders: currentItemIds.map((itemId, index) => ({
      itemId,
      position: index + 1,
    })),
  };

  await playlist.updateItemsOrder(payload);
};

const rememberPlaylistOrder = () => {
  const currentPlaylist = playlist.list;
  if (!currentPlaylist) {
    originalOrder.value = null;
    return;
  }

  const itemIds = getPlaylistItemIds(currentPlaylist.items);
  originalOrder.value = itemIds
    ? {
        playlistId: currentPlaylist.id,
        itemIds,
      }
    : null;
};

const onPlaylistClosed = async () => {
  const previousOrder = originalOrder.value;
  originalOrder.value = null;

  if (!previousOrder || playlist.list?.id !== previousOrder.playlistId) return;
  await checkPlaylistOrderChange(previousOrder.itemIds);
};

const moveSongWithKeyboard = (index: number, event: KeyboardEvent) => {
  let toIndex = index;

  if (event.key === 'ArrowUp') toIndex = index - 1;
  else if (event.key === 'ArrowDown') toIndex = index + 1;
  else if (event.key === 'Home') toIndex = 0;
  else if (event.key === 'End') toIndex = playlistItems.value.length - 1;
  else return;

  event.preventDefault();
  if (toIndex < 0 || toIndex >= playlistItems.value.length || toIndex === index) return;

  playlist.reorderItems(index, toIndex);
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
    @open="rememberPlaylistOrder"
    @closed="onPlaylistClosed"
  >
    <div class="flex h-full w-full flex-col overflow-hidden">
      <p class="mb-3 text-base font-semibold text-foreground md:text-lg">Playlist Queue</p>
      <div class="flex flex-1 flex-col overflow-auto overscroll-none px-1">
        <VueDraggable
          v-model="playlistItems"
          class="flex flex-col"
          handle=".playlist-drag-handle"
          ghost-class="!opacity-25"
          chosen-class="!cursor-grabbing"
          drag-class="!opacity-90"
          :animation="180"
          :force-fallback="true"
          :fallback-on-body="true"
          :fallback-tolerance="4"
          :scroll="true"
          :scroll-sensitivity="64"
          :scroll-speed="12"
          :touch-start-threshold="3"
        >
          <div v-for="(song, index) in playlistItems" :key="song.playlistItemId ?? song.id" class="relative shrink-0">
            <div class="group relative flex items-center">
              <button type="button" class="relative flex min-w-0 flex-1 items-center px-1 py-2.5" @click="selectSong(song)">
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
              <div
                class="playlist-highligh pointer-events-none absolute left-0 top-0 hidden size-full bg-[linear-gradient(150deg,transparent_0%,transparent_10%,#b994ff33_50%,transparent_90%,transparent_100%)] bg-[length:200%_100%] bg-no-repeat group-hover:!block"
                :class="{ '!block': song.id === current?.id || song.videoId === videoId }"
              ></div>
              <button
                type="button"
                class="playlist-drag-handle relative z-10 mr-1 flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-foreground-muted transition-colors active:cursor-grabbing"
                :aria-label="`Move ${getLyricsTitleLabel(song)}. Use arrow keys to reorder.`"
                @keydown="moveSongWithKeyboard(index, $event)"
              >
                <svg viewBox="0 0 20 20" class="size-5" aria-hidden="true">
                  <circle cx="7" cy="5" r="1.4" fill="currentColor" />
                  <circle cx="13" cy="5" r="1.4" fill="currentColor" />
                  <circle cx="7" cy="10" r="1.4" fill="currentColor" />
                  <circle cx="13" cy="10" r="1.4" fill="currentColor" />
                  <circle cx="7" cy="15" r="1.4" fill="currentColor" />
                  <circle cx="13" cy="15" r="1.4" fill="currentColor" />
                </svg>
              </button>
            </div>
            <div
              v-if="index < playlistItems.length - 1"
              class="h-px w-full shrink-0 bg-border shadow-[0_0_3px_#31018c74] dark:shadow-[0_0_3px_#0f3e71]"
            ></div>
          </div>
        </VueDraggable>
      </div>
    </div>
  </CustomPopup>
</template>
<style scoped>
.playlist-highligh {
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
