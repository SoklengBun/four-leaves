<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import CustomPopup from '~/components/shares/CustomPopup.vue';
import { useAuth } from '~/stores/auth';
import { usePlayer } from '~/stores/player';
import { usePlaylist } from '~/stores/playlist';
import { UserRole } from '~/types/user';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';

const emit = defineEmits<{ refresh: [] }>();

const show = defineModel<boolean>('show', { required: true });

const router = useRouter();
const auth = useAuth();

const player = usePlayer();
const { artists, current } = storeToRefs(player);

const playlist = usePlaylist();
const { lists, list } = storeToRefs(playlist);

const displayTitle = computed(() => getLyricsTitleLabel(current.value));
const displayArtist = computed(() => getLyricsArtistsLabel(artists.value));
const isAdmin = computed(() => auth.user?.role === UserRole.ADMIN);

const expandPlaylist = ref(false);
const addingPlaylistId = ref<number | null>(null);
const isRemovingFromPlaylist = ref(false);

const isCanRemove = computed(() => {
  return list.value?.createdById === auth.user?.id;
});

const onClose = () => {
  show.value = false;
};

const togglePlaylistList = () => {
  expandPlaylist.value = !expandPlaylist.value;
};

const refresh = () => {
  emit('refresh');
  onClose();
};

const edit = () => {
  if (!current.value?.id) return;
  onClose();
  router.push({ name: 'lyrics-edit', params: { id: current.value.id } });
};

const onCreatePlaylist = () => {
  if (!current.value?.id) return;
  playlist.openCreatePopup([current.value.id]);
  onClose();
};

const onAddToPlaylist = async (playlistId: number) => {
  if (!current.value?.id) return;
  if (addingPlaylistId.value !== null) return;
  addingPlaylistId.value = playlistId;

  try {
    await playlist.addItems(playlistId, [current.value.id]);
    onClose();
  } finally {
    addingPlaylistId.value = null;
  }
};

const onRemoveFromPlaylist = async () => {
  if (!current.value?.playlistItemId) return;
  if (isRemovingFromPlaylist.value) return;

  isRemovingFromPlaylist.value = true;

  try {
    await playlist.removeItem(current.value.playlistItemId);
    player.playNext();
    onClose();
  } finally {
    isRemovingFromPlaylist.value = false;
  }
};

const isSongExist = (playlist: Playlist) => {
  const isExist = playlist.items.find((e) => e.id === current.value?.id);

  return !!isExist;
};

const isAddingToPlaylist = (playlistId: number) => addingPlaylistId.value === playlistId;
</script>

<template>
  <CustomPopup
    v-model:show="show"
    desktop-position="right"
    mobile-position="right"
    eyebrow="Song actions"
    :title="displayTitle || 'Current song'"
    :description="displayArtist || 'Choose what you want to do next.'"
    @close="onClose"
  >
    <div class="flex flex-1 flex-col gap-[10px] overflow-y-auto pb-4">
      <div class="rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-[#9a6782] shadow-[0_12px_24px_#ebbcd229]">
        <button type="button" class="flex w-full items-center gap-3 text-left" @click="togglePlaylistList">
          <span
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
          >
            +
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <strong class="text-sm">Add to playlist</strong>
            <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">Choose one of your playlists or create a new one.</small>
          </span>
          <span class="text-sm text-[#c2799d]">{{ expandPlaylist ? '−' : '+' }}</span>
        </button>

        <div v-if="expandPlaylist" class="mt-3 border-t border-[#f7d7e6] pt-3">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-2xl bg-[#fff4fa] px-3 py-3 text-left text-sm font-semibold text-[#b45c88] disabled:cursor-wait disabled:opacity-70"
            :disabled="addingPlaylistId !== null || isRemovingFromPlaylist"
            @click="onCreatePlaylist"
          >
            <span>Create new</span>
            <span class="text-lg leading-none">+</span>
          </button>

          <div v-if="lists.length" class="mt-3 space-y-2">
            <button
              v-for="item in playlist.lists"
              :key="item.id"
              type="button"
              class="flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-100"
              :class="isSongExist(item) ? 'border-[#ffc6dc] bg-[#fff1f7]' : 'border-[#ffe2ee] bg-[#fffdfd]'"
              :disabled="isSongExist(item) || addingPlaylistId !== null || isRemovingFromPlaylist"
              @click="onAddToPlaylist(item.id)"
            >
              <span class="min-w-0">
                <span class="block truncate text-sm font-semibold text-[#8f5a77]">{{ item.name }}</span>
                <span class="mt-1 block text-xs text-[#b08a9f]">
                  {{
                    isSongExist(item)
                      ? 'Already in this playlist'
                      : isAddingToPlaylist(item.id)
                        ? 'Adding this song to your playlist...'
                        : `${item.items.length} song${item.items.length === 1 ? '' : 's'}`
                  }}
                </span>
              </span>
              <span
                class="ml-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]"
                :class="isSongExist(item) ? 'text-[#d96a98]' : 'text-[#d583ab]'"
              >
                <span
                  v-if="isAddingToPlaylist(item.id)"
                  class="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
                  aria-hidden="true"
                />
                {{ isSongExist(item) ? 'Added' : isAddingToPlaylist(item.id) ? 'Adding' : 'Add' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <button
        v-if="isCanRemove"
        type="button"
        class="flex w-full items-center gap-3 rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-left text-[#9a6782] shadow-[0_12px_24px_#ebbcd229] disabled:cursor-wait disabled:opacity-80"
        :disabled="isRemovingFromPlaylist || addingPlaylistId !== null"
        @click="onRemoveFromPlaylist"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
        >
          <span
            v-if="isRemovingFromPlaylist"
            class="h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
            aria-hidden="true"
          />
          <span v-else>−</span>
        </span>
        <span class="flex flex-col">
          <strong class="text-sm">{{ isRemovingFromPlaylist ? 'Removing from playlist' : 'Remove from playlist' }}</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">
            {{ isRemovingFromPlaylist ? 'Removing this song from your playlist...' : 'Take this song out of the playlist you own.' }}
          </small>
        </span>
      </button>

      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-left text-[#9a6782] shadow-[0_12px_24px_#ebbcd229]"
        @click="refresh"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
        >
          ↻
        </span>
        <span class="flex flex-col">
          <strong class="text-sm">Refresh</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">Reload the latest lyric detail for this song.</small>
        </span>
      </button>

      <button
        v-if="isAdmin"
        type="button"
        class="flex w-full items-center gap-3 rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-left text-[#825c71] shadow-[0_12px_24px_#ebbcd229]"
        @click="edit"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
        >
          ✎
        </span>
        <span class="flex flex-col">
          <strong class="text-sm">Edit</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">Open the admin editor for this lyric entry.</small>
        </span>
      </button>
    </div>
  </CustomPopup>
</template>
