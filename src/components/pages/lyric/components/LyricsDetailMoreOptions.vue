<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/stores/auth';
import { usePlayer } from '~/stores/player';
import { usePlaylistStore } from '~/stores/usePlaylistStore';
import { addItemsToPlaylist, createPlaylist, removePlaylistItem } from '~/services/playlist';
import { UserRole } from '~/types/user';
import { useHomeStorage } from '~/utils/home-storage';
import { getLyricsArtistsLabel, getLyricsTitleLabel, normalizePlaylistItems } from '~/utils/lyrics';
import showToast from '~/utils/toast';

const emit = defineEmits<{
  refresh: [];
}>();

const show = defineModel<boolean>('show', { required: true });

const router = useRouter();
const player = usePlayer();
const auth = useAuth();
const playlistStore = usePlaylistStore();
const homeStorage = useHomeStorage();
const { artists, current, playlist } = storeToRefs(player);
const { playlists } = storeToRefs(playlistStore);

const isPlaylistListOpen = ref(false);
const isCreatingPlaylist = ref(false);
const isSavingPlaylist = ref(false);
const newPlaylistName = ref('');

const displayTitle = computed(() => getLyricsTitleLabel(current.value));
const displayArtist = computed(() => getLyricsArtistsLabel(artists.value));
const isAdmin = computed(() => auth.user?.role === UserRole.ADMIN);
const currentUserId = computed(() => auth.user?.id ?? null);
const currentVideoId = computed(() => current.value?.videoId ?? '');

const ownedPlaylists = computed(() => {
  if (!currentUserId.value) return [];
  return playlists.value.filter((item) => item.createdById === currentUserId.value);
});

const canRemoveFromPlaylist = computed(() => {
  return !!playlist.value && !!currentUserId.value && playlist.value.createdById === currentUserId.value;
});

const resetOverlayState = () => {
  isPlaylistListOpen.value = false;
  isCreatingPlaylist.value = false;
  newPlaylistName.value = '';
};

const close = () => {
  show.value = false;
  resetOverlayState();
};

const onUpdateShow = (value: boolean) => {
  show.value = value;
  if (!value) resetOverlayState();
};

const syncHomePlaylistIfPresent = (nextPlaylist: Playlist) => {
  const currentPlaylists = homeStorage.value.playlists ?? [];
  if (!currentPlaylists.some((item) => item.id === nextPlaylist.id)) return;

  homeStorage.value = {
    ...homeStorage.value,
    playlists: currentPlaylists.map((item) => (item.id === nextPlaylist.id ? nextPlaylist : item)),
  };
};

const buildPlaylistItem = (): PlaylistItem | null => {
  if (!current.value) return null;
  return { ...current.value };
};

const playlistContainsCurrentSong = (targetPlaylist: Playlist) => {
  if (!currentVideoId.value) return false;
  return targetPlaylist.items.some((item) => item.videoId === currentVideoId.value);
};

const replacePlaylistInCollection = (nextPlaylist: Playlist) => {
  playlistStore.replacePlaylist(nextPlaylist);
  syncHomePlaylistIfPresent(nextPlaylist);
};

const addSongToPlaylist = async (targetPlaylist: Playlist) => {
  const song = buildPlaylistItem();
  if (!song) return;
  if (!current.value?.id) {
    showToast({ message: 'Missing lyrics id for this song', type: 'error' });
    return;
  }

  const alreadySaved = playlistContainsCurrentSong(targetPlaylist);
  if (alreadySaved) {
    showToast({ message: `Song is already in ${targetPlaylist.name}`, type: 'warning' });
    return;
  }

  isSavingPlaylist.value = true;
  try {
    const { data } = await addItemsToPlaylist(targetPlaylist.id, { lyricsIds: [current.value.id] });
    if (data.value?.code !== 0) {
      showToast({ message: data.value?.message || `Failed to add to ${targetPlaylist.name}`, type: 'error' });
      return;
    }

    const nextPlaylist = data.value?.data
      ? normalizePlaylistItems(data.value.data as RawPlaylist)
      : { ...targetPlaylist, items: [...targetPlaylist.items, song] };
    replacePlaylistInCollection(nextPlaylist);

    if (playlist.value?.id === targetPlaylist.id) {
      playlist.value = nextPlaylist;
    }

    showToast({ message: `Added to ${nextPlaylist.name}`, type: 'success' });
    close();
  } catch {
    showToast({ message: `Network error while adding to ${targetPlaylist.name}`, type: 'error' });
  } finally {
    isSavingPlaylist.value = false;
  }
};

const togglePlaylistList = () => {
  isPlaylistListOpen.value = !isPlaylistListOpen.value;
  if (!isPlaylistListOpen.value) {
    isCreatingPlaylist.value = false;
    newPlaylistName.value = '';
  }
};

const startCreatingPlaylist = () => {
  isPlaylistListOpen.value = true;
  isCreatingPlaylist.value = true;
};

const onCreatePlaylist = async () => {
  const song = buildPlaylistItem();
  const name = newPlaylistName.value.trim();

  if (!song) return;
  if (!current.value?.id) {
    showToast({ message: 'Missing lyrics id for this song', type: 'error' });
    return;
  }
  if (!name) {
    showToast({ message: 'Playlist name is required', type: 'warning' });
    return;
  }

  const duplicate = ownedPlaylists.value.some((item) => item.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase());
  if (duplicate) {
    showToast({ message: 'You already have a playlist with this name', type: 'warning' });
    return;
  }

  isSavingPlaylist.value = true;
  try {
    const { data } = await createPlaylist({
      name,
      description: 'Created from the lyric detail page.',
      isPublic: false,
      lyricsIds: [current.value.id],
    });

    if (data.value?.code !== 0) {
      showToast({ message: data.value?.message || 'Failed to create playlist', type: 'error' });
      return;
    }

    const nextPlaylist = data.value?.data
      ? normalizePlaylistItems(data.value.data as RawPlaylist)
      : ({
          id: Date.now(),
          name,
          description: 'Created from the lyric detail page.',
          isPublic: false,
          createdById: currentUserId.value ?? undefined,
          items: [song],
        } as Playlist);

    replacePlaylistInCollection(nextPlaylist);
    playlist.value = nextPlaylist;

    showToast({ message: `Created ${nextPlaylist.name}`, type: 'success' });
    close();
  } catch {
    showToast({ message: 'Network error while creating playlist', type: 'error' });
  } finally {
    isSavingPlaylist.value = false;
  }
};

const removeFromPlaylist = async () => {
  if (!current.value?.videoId || !playlist.value) return;

  const currentPlaylist = playlist.value;
  const currentPlaylistItem = currentPlaylist.items.find((item) => item.videoId === current.value?.videoId);
  if (!currentPlaylistItem) {
    showToast({ message: 'Song is not in this playlist', type: 'warning' });
    close();
    return;
  }

  if (!currentPlaylistItem.playlistItemId) {
    showToast({ message: 'Missing playlist item id for this song', type: 'error' });
    return;
  }

  isSavingPlaylist.value = true;
  try {
    const { data } = await removePlaylistItem(currentPlaylist.id, currentPlaylistItem.playlistItemId);
    if (data.value?.code !== 0) {
      showToast({ message: data.value?.message || `Failed to remove from ${currentPlaylist.name}`, type: 'error' });
      return;
    }

    const nextPlaylist = data.value?.data
      ? normalizePlaylistItems(data.value.data as RawPlaylist)
      : {
          ...currentPlaylist,
          items: currentPlaylist.items.filter((item) => item.playlistItemId !== currentPlaylistItem.playlistItemId),
        };

    replacePlaylistInCollection(nextPlaylist);
    playlist.value = nextPlaylist;

    showToast({ message: `Removed from ${nextPlaylist.name}`, type: 'success' });
    close();
  } catch {
    showToast({ message: `Network error while removing from ${currentPlaylist.name}`, type: 'error' });
  } finally {
    isSavingPlaylist.value = false;
  }
};

const refresh = () => {
  emit('refresh');
  close();
};

const edit = () => {
  if (!current.value?.id) return;
  close();
  router.push({ name: 'lyrics-edit', params: { id: current.value.id } });
};
</script>

<template>
  <van-popup :show="show" position="right" :style="{ background: 'transparent' }" class="bg-transparent" @update:show="onUpdateShow">
    <div
      class="flex h-full min-h-screen w-[min(88vw,360px)] flex-col bg-[radial-gradient(circle_at_top_right,_#ffd3e5d9,_transparent_28%),linear-gradient(180deg,_#fffafc_0%,_#fff1f7_100%)] px-4 pb-5 pt-4 shadow-[-12px_0_32px_#d88fb12e]"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d583ab]">Song actions</p>
          <h3 class="mt-2 text-[22px] font-extrabold leading-[1.2] text-[#7d4d69]">{{ displayTitle || 'Current song' }}</h3>
          <p class="mt-[6px] text-[13px] leading-[1.5] text-[#a67b92]">
            {{ displayArtist || 'Choose what you want to do next.' }}
          </p>
        </div>

        <button
          type="button"
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#ffd7e9f2] bg-[#ffffffdb] text-lg text-[#9a6782] shadow-[0_12px_24px_#ebbcd229]"
          aria-label="Close"
          @click="close"
        >
          ×
        </button>
      </div>

      <div class="mt-5 flex flex-1 flex-col gap-[10px] overflow-y-auto pb-4">
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
            <span class="text-sm text-[#c2799d]">{{ isPlaylistListOpen ? '−' : '+' }}</span>
          </button>

          <div v-if="isPlaylistListOpen" class="mt-3 border-t border-[#f7d7e6] pt-3">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-2xl bg-[#fff4fa] px-3 py-3 text-left text-sm font-semibold text-[#b45c88]"
              @click="startCreatingPlaylist"
            >
              <span>Create new</span>
              <span class="text-lg leading-none">+</span>
            </button>

            <div v-if="isCreatingPlaylist" class="mt-3 rounded-2xl border border-[#ffddea] bg-white px-3 py-3">
              <input
                v-model="newPlaylistName"
                type="text"
                placeholder="Playlist name"
                class="w-full rounded-xl border border-[#ffd5eb] bg-[#fffafc] px-3 py-2 text-sm text-[#6f4b61] outline-none focus:border-[#ff87b8]"
                @keydown.enter.prevent="onCreatePlaylist"
              />
              <button
                type="button"
                class="mt-2 w-full rounded-xl bg-[linear-gradient(180deg,_#ff80b7_0%,_#ff5ca0_100%)] px-3 py-2 text-sm font-bold text-white shadow-[0_12px_24px_#ff6dad2c] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSavingPlaylist"
                @click="onCreatePlaylist"
              >
                {{ isSavingPlaylist ? 'Saving...' : 'Create and add song' }}
              </button>
            </div>

            <div v-if="ownedPlaylists.length" class="mt-3 space-y-2">
              <button
                v-for="item in ownedPlaylists"
                :key="item.id"
                type="button"
                class="flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-100"
                :class="
                  playlistContainsCurrentSong(item)
                    ? 'border-[#ffc6dc] bg-[#fff1f7]'
                    : 'border-[#ffe2ee] bg-[#fffdfd]'
                "
                :disabled="isSavingPlaylist || playlistContainsCurrentSong(item)"
                @click="addSongToPlaylist(item)"
              >
                <span class="min-w-0">
                  <span class="block truncate text-sm font-semibold text-[#8f5a77]">{{ item.name }}</span>
                  <span class="mt-1 block text-xs text-[#b08a9f]">
                    {{
                      playlistContainsCurrentSong(item)
                        ? 'Already in this playlist'
                        : `${item.items.length} song${item.items.length === 1 ? '' : 's'}`
                    }}
                  </span>
                </span>
                <span class="ml-3 text-xs font-semibold uppercase tracking-[0.08em]" :class="playlistContainsCurrentSong(item) ? 'text-[#d96a98]' : 'text-[#d583ab]'">
                  {{ playlistContainsCurrentSong(item) ? 'Added' : 'Add' }}
                </span>
              </button>
            </div>

            <p v-else-if="!isCreatingPlaylist" class="mt-3 text-xs leading-[1.5] text-[#af849a]">You do not have any playlists yet.</p>
          </div>
        </div>

        <button
          v-if="canRemoveFromPlaylist"
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
    </div>
  </van-popup>
</template>
