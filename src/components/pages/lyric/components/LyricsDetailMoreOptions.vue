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
const { lists } = storeToRefs(playlist);

const displayTitle = computed(() => getLyricsTitleLabel(current.value));
const displayArtist = computed(() => getLyricsArtistsLabel(artists.value));
const isAdmin = computed(() => auth.user?.role === UserRole.ADMIN);

const expandPlaylist = ref(false);

const onCreatePlaylist = () => {
  if (!current.value?.id) return;
  playlist.openCreatePopup([current.value.id]);
};

const onAddToPlaylist = (playlistId: number) => {
  if (!current.value?.id) return;
  playlist.add(playlistId, [current.value.id]);
};

const removeFromPlaylist = () => {
  if (!current.value?.playlistItemId) return;

  playlist.remove(current.value.playlistItemId);
  player.playNext();
};

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

const isSongExist = (playlist: Playlist) => {
  const isExist = playlist.items.find((e) => e.id === current.value?.id);

  return !!isExist;
};
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
            class="flex w-full items-center justify-between rounded-2xl bg-[#fff4fa] px-3 py-3 text-left text-sm font-semibold text-[#b45c88]"
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
              :disabled="isSongExist(item)"
              @click="onAddToPlaylist(item.id)"
            >
              <span class="min-w-0">
                <span class="block truncate text-sm font-semibold text-[#8f5a77]">{{ item.name }}</span>
                <span class="mt-1 block text-xs text-[#b08a9f]">
                  {{ isSongExist(item) ? 'Already in this playlist' : `${item.items.length} song${item.items.length === 1 ? '' : 's'}` }}
                </span>
              </span>
              <span class="ml-3 text-xs font-semibold uppercase tracking-[0.08em]" :class="isSongExist(item) ? 'text-[#d96a98]' : 'text-[#d583ab]'">
                {{ isSongExist(item) ? 'Added' : 'Add' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-left text-[#9a6782] shadow-[0_12px_24px_#ebbcd229]"
        @click="removeFromPlaylist"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
        >
          −
        </span>
        <span class="flex flex-col">
          <strong class="text-sm">Remove from playlist</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">Take this song out of the playlist you own.</small>
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
