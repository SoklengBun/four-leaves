<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';
import ConfirmDialog from '~/components/shares/ConfirmDialog.vue';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { useAuth } from '~/stores/auth';
import { usePlaylist } from '~/stores/playlist';
import { getLyricsTitleLabel, getCoverArtistsLabel } from '~/utils/lyrics';

const props = withDefaults(
  defineProps<{
    playlist: Playlist;
    layout?: 'row' | 'grid';
  }>(),
  {
    layout: 'row',
  },
);

const emit = defineEmits<{
  select: [song: PlaylistItem];
}>();

const auth = useAuth();
const playlistStore = usePlaylist();
const { list } = storeToRefs(playlistStore);

const showRemoveConfirm = ref(false);
const isRemovingPlaylist = ref(false);

const canRemovePlaylist = computed(() => {
  return !!props.playlist.id && props.playlist.createdById === auth.user?.id;
});

const playlistDescription = computed(() => {
  if (props.playlist.description) return props.playlist.description;

  return 'A playlist from your personal library.';
});

const onSelect = (song: PlaylistItem) => {
  emit('select', song);
};

const openRemoveConfirm = () => {
  if (!canRemovePlaylist.value || isRemovingPlaylist.value) return;
  showRemoveConfirm.value = true;
};

const closeRemoveConfirm = () => {
  if (isRemovingPlaylist.value) return;
  showRemoveConfirm.value = false;
};

const onRemovePlaylist = async () => {
  if (!canRemovePlaylist.value || isRemovingPlaylist.value) return;

  isRemovingPlaylist.value = true;

  try {
    if (list.value?.id === props.playlist.id) {
      list.value = props.playlist;
    }

    await playlistStore.remove(props.playlist.id);
    showRemoveConfirm.value = false;
  } finally {
    isRemovingPlaylist.value = false;
  }
};

const getThumbnailId = (song: PlaylistItem) => {
  if (!song.defaultCoverId) return song.videoId;

  const cover = song.covers?.find((item) => item.id === song.defaultCoverId);
  return cover?.id || song.videoId;
};
</script>

<template>
  <section v-if="playlist.items.length" class="space-y-3">
    <div class="flex items-end justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-lg font-semibold text-[#2b1f28] md:text-xl">{{ playlist.name }}</h2>
        <p v-if="playlist.description" class="mt-1 text-xs text-[#7f6675] md:text-sm">{{ playlist.description }}</p>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <p class="text-xs font-medium uppercase tracking-[0.24em] text-[#d184ad]">{{ playlist.items.length }} songs</p>

        <button
          v-if="canRemovePlaylist"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[#ffc7dc] bg-[linear-gradient(180deg,_#fffafc_0%,_#fff0f6_100%)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ca5d8b] shadow-[0_10px_18px_#f7bfd426,inset_0_1px_0_#ffffffd6] transition-[transform,box-shadow,border-color] duration-150 hover:border-[#ffabc9] hover:shadow-[0_12px_22px_#f5a9c926] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          :disabled="isRemovingPlaylist"
          @click="openRemoveConfirm"
        >
          <span
            v-if="isRemovingPlaylist"
            class="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
            aria-hidden="true"
          />
          <span v-else class="text-sm leading-none">−</span>
          {{ isRemovingPlaylist ? 'Removing' : 'Remove playlist' }}
        </button>
      </div>
    </div>

    <div :class="layout === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4' : 'flex gap-3 overflow-x-auto pb-2'">
      <button
        v-for="song in playlist.items"
        :key="song.id"
        type="button"
        :class="
          layout === 'grid'
            ? 'lyric-card lyric-card--grid box-cover group w-full rounded-[24px] p-2.5 text-left'
            : 'lyric-card box-cover group w-[132px] shrink-0 rounded-[24px] p-2.5 text-left md:w-[164px]'
        "
        @click="onSelect(song)"
      >
        <div class="relative aspect-square overflow-hidden rounded-[18px] bg-[#f6d8e8]">
          <YoutubeThumbnail :id="getThumbnailId(song)" />
        </div>

        <div class="mt-3 min-w-0">
          <MarqueeText :text="getLyricsTitleLabel(song)" class="text-sm font-semibold text-[#2b1f28] md:text-base" :gap="28" />
          <MarqueeText :text="getCoverArtistsLabel(song) || 'Unknown artist'" class="mt-1 text-xs text-[#816776] md:text-sm" :gap="24" :speed="32" />
        </div>
      </button>
    </div>

    <ConfirmDialog
      v-model:show="showRemoveConfirm"
      eyebrow="Remove playlist"
      :title="`Delete ${playlist.name}?`"
      :description="`This will remove the playlist and its ${playlist.items.length} song${playlist.items.length === 1 ? '' : 's'} from your library.`"
      confirm-text="Delete playlist"
      cancel-text="Keep playlist"
      :loading="isRemovingPlaylist"
      @cancel="closeRemoveConfirm"
      @confirm="onRemovePlaylist"
    >
      <div class="rounded-[22px] border border-[#ffd6e4] bg-[#fff8fb] p-4 text-sm text-[#8d6278] shadow-[inset_0_1px_0_#ffffffd9]">
        <p class="font-semibold text-[#a6547a]">{{ playlist.name }}</p>
        <p class="mt-1 leading-[1.55]">{{ playlistDescription }}</p>
      </div>
    </ConfirmDialog>
  </section>
</template>

<style scoped>
.lyric-card {
  background: linear-gradient(180deg, rgb(255 250 252 / 96%) 0%, rgb(255 240 247 / 98%) 100%);
  border: 1px solid #ffd7e8;
  box-shadow:
    0 12px 30px rgb(255 171 207 / 20%),
    inset 0 1px 0 rgb(255 255 255 / 80%);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.lyric-card:hover {
  transform: translateY(-2px);
  border-color: #ffb9d8;
  box-shadow:
    0 16px 34px rgb(255 157 198 / 24%),
    inset 0 1px 0 rgb(255 255 255 / 90%);
}

.lyric-card:active {
  transform: scale(0.985);
}

.lyric-card--grid {
  min-width: 0;
}
</style>
