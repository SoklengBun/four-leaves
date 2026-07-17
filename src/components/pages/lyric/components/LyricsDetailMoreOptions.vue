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
    :animate-title="false"
    @close="onClose"
  >
    <div class="flex flex-1 flex-col gap-[10px] overflow-y-auto pb-4">
      <div class="rounded-[20px] border border-border bg-card p-[14px] text-foreground shadow-none">
        <button type="button" class="flex w-full items-center gap-3 text-left" @click="togglePlaylistList">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-[18px] leading-none text-primary">
            +
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <strong class="text-sm">Add to playlist</strong>
            <small class="mt-0.5 text-xs leading-[1.45] text-foreground-muted">Choose one of your playlists or create a new one.</small>
          </span>
          <span class="text-sm text-primary">{{ expandPlaylist ? '−' : '+' }}</span>
        </button>

        <div v-if="expandPlaylist" class="mt-3 border-t border-border pt-3">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-2xl bg-primary-soft px-3 py-3 text-left text-sm font-semibold text-primary transition-colors hover:bg-surface-hover disabled:cursor-wait disabled:opacity-70"
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
              class="flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-100"
              :class="isSongExist(item) ? 'border-border-strong bg-primary-soft' : 'border-border bg-surface hover:bg-card-hover'"
              :disabled="isSongExist(item) || addingPlaylistId !== null || isRemovingFromPlaylist"
              @click="onAddToPlaylist(item.id)"
            >
              <span class="min-w-0">
                <span class="block truncate text-sm font-semibold text-foreground">{{ item.name }}</span>
                <span class="mt-1 block text-xs text-foreground-muted">
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
                :class="isSongExist(item) ? 'text-primary' : 'text-secondary'"
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
        class="flex w-full items-center gap-3 rounded-[20px] border border-border bg-card p-[14px] text-left text-foreground shadow-none transition-colors hover:bg-card-hover disabled:cursor-wait disabled:opacity-80"
        :disabled="isRemovingFromPlaylist || addingPlaylistId !== null"
        @click="onRemoveFromPlaylist"
      >
        <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-[18px] leading-none text-primary">
          <span
            v-if="isRemovingFromPlaylist"
            class="h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
            aria-hidden="true"
          />
          <span v-else>−</span>
        </span>
        <span class="flex flex-col">
          <strong class="text-sm">{{ isRemovingFromPlaylist ? 'Removing from playlist' : 'Remove from playlist' }}</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-foreground-muted">
            {{ isRemovingFromPlaylist ? 'Removing this song from your playlist...' : 'Take this song out of the playlist you own.' }}
          </small>
        </span>
      </button>

      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-[20px] border border-border bg-card p-[14px] text-left text-foreground shadow-none transition-colors hover:bg-card-hover"
        @click="refresh"
      >
        <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-[18px] leading-none text-primary">
          ↻
        </span>
        <span class="flex flex-col">
          <strong class="text-sm">Refresh</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-foreground-muted">Reload the latest lyric detail for this song.</small>
        </span>
      </button>

      <button
        v-if="isAdmin"
        type="button"
        class="flex w-full items-center gap-3 rounded-[20px] border border-border bg-card p-[14px] text-left text-foreground shadow-none transition-colors hover:bg-card-hover"
        @click="edit"
      >
        <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-[18px] leading-none text-primary">
          ✎
        </span>
        <span class="flex flex-col">
          <strong class="text-sm">Edit</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-foreground-muted">Open the admin editor for this lyric entry.</small>
        </span>
      </button>
    </div>
  </CustomPopup>
</template>
