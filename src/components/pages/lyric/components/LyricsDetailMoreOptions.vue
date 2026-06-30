<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayer } from '~/stores/player';
import { useAuth } from '~/stores/auth';
import { UserRole } from '~/types/user';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import showToast from '~/utils/toast';

const show = defineModel<boolean>('show', { required: true });

const router = useRouter();
const player = usePlayer();
const auth = useAuth();
const { artists, current, playlist, showPlaylist } = storeToRefs(player);

const savedPlaylist = useLocalStorage<Playlist>('lyrics-saved-playlist', {
  id: -1,
  name: 'My Playlist',
  description: 'Songs saved from the lyric detail page.',
  isPublic: false,
  items: [],
});
const favoriteSongIds = useLocalStorage<string[]>('lyrics-favorite-song-ids', []);

const displayTitle = computed(() => getLyricsTitleLabel(current.value));
const displayArtist = computed(() => getLyricsArtistsLabel(artists.value));
const isAdmin = computed(() => auth.user?.role === UserRole.ADMIN);
const isFavorite = computed(() => {
  const songId = current.value?.videoId;
  return !!songId && favoriteSongIds.value.includes(songId);
});

const close = () => {
  show.value = false;
};

const addToPlaylist = () => {
  if (!current.value) return;

  const alreadySaved = savedPlaylist.value.items.some((song) => song.videoId === current.value?.videoId);
  if (alreadySaved) {
    showToast({ message: 'Song is already in My Playlist', type: 'warning' });
  } else {
    savedPlaylist.value = {
      ...savedPlaylist.value,
      items: [...savedPlaylist.value.items, { ...current.value }],
    };
    showToast({ message: 'Added to My Playlist', type: 'success' });
  }

  playlist.value = savedPlaylist.value;
  showPlaylist.value = true;
  close();
};

const toggleFavorite = () => {
  if (!current.value?.videoId) return;

  if (isFavorite.value) {
    favoriteSongIds.value = favoriteSongIds.value.filter((id) => id !== current.value?.videoId);
    showToast({ message: 'Removed from favorites', type: 'success' });
  } else {
    favoriteSongIds.value = [...favoriteSongIds.value, current.value.videoId];
    showToast({ message: 'Added to favorites', type: 'success' });
  }

  close();
};

const edit = () => {
  if (!current.value?.id) return;
  close();
  router.push({ name: 'lyrics-edit', params: { id: current.value.id } });
};
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ background: 'transparent' }"
    class="bg-transparent"
    @update:show="show = $event"
  >
    <div
      class="rounded-t-[28px] bg-[radial-gradient(circle_at_top_right,_#ffd3e5e6,_transparent_32%),linear-gradient(180deg,_#fffafc_0%,_#fff1f7_100%)] px-[14px] pb-5 pt-[14px] shadow-[0_-10px_30px_#d88fb12e]"
    >
      <div class="mx-auto mb-[14px] h-[5px] w-[52px] rounded-full bg-[#d08eaf52]"></div>
      <p class="m-0 text-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d583ab]">Song actions</p>
      <h3 class="mt-2 text-center text-[22px] font-extrabold leading-[1.2] text-[#7d4d69]">{{ displayTitle || 'Current song' }}</h3>
      <p class="mb-4 mt-[6px] text-center text-[13px] leading-[1.5] text-[#a67b92]">
        {{ displayArtist || 'Choose what you want to do next.' }}
      </p>

      <button
        type="button"
        class="mt-[10px] flex w-full items-center gap-3 rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-left text-[#9a6782] shadow-[0_12px_24px_#ebbcd229]"
        @click="addToPlaylist"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
          >+</span
        >
        <span class="flex flex-col">
          <strong class="text-sm">Add to playlist</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">Save this song into your local listening queue.</small>
        </span>
      </button>

      <button
        type="button"
        class="mt-[10px] flex w-full items-center gap-3 rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-left text-[#9a6782] shadow-[0_12px_24px_#ebbcd229]"
        @click="toggleFavorite"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
          >{{ isFavorite ? '♥' : '♡' }}</span
        >
        <span class="flex flex-col">
          <strong class="text-sm">{{ isFavorite ? 'Remove from favorite' : 'Add to favorite' }}</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">{{
            isFavorite ? 'Take it out of your saved favorites.' : 'Keep this song in your quick favorite list.'
          }}</small>
        </span>
      </button>

      <button
        v-if="isAdmin"
        type="button"
        class="mt-[10px] flex w-full items-center gap-3 rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-left text-[#825c71] shadow-[0_12px_24px_#ebbcd229]"
        @click="edit"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
          >✎</span
        >
        <span class="flex flex-col">
          <strong class="text-sm">Edit</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">Open the admin editor for this lyric entry.</small>
        </span>
      </button>

      <button
        type="button"
        class="mt-[14px] w-full rounded-full bg-[linear-gradient(180deg,_#ff80b7_0%,_#ff5ca0_100%)] px-4 py-3 text-[13px] font-extrabold text-white shadow-[0_14px_26px_#ff6dad38]"
        @click="close"
      >
        Close
      </button>
    </div>
  </van-popup>
</template>
