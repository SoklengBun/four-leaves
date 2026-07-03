<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { getLyricsTitleLabel, getCoverArtistsLabel } from '~/utils/lyrics';

const props = withDefaults(
  defineProps<{
    playlist: Playlist;
    layout?: 'row' | 'grid';
    maxItems?: number;
    enableViewMore?: boolean;
  }>(),
  {
    layout: 'row',
    maxItems: 4,
    enableViewMore: true,
  },
);

const emit = defineEmits<{
  select: [song: PlaylistItem];
}>();

const router = useRouter();

const visibleItems = computed(() => {
  if (props.maxItems <= 0) return props.playlist.items;
  return props.playlist.items.slice(0, props.maxItems);
});

const shouldShowViewMore = computed(() => {
  return props.enableViewMore && props.playlist.id > 0;
});

const onSelect = (song: PlaylistItem) => {
  emit('select', song);
};

const onViewMore = () => {
  router.push({ name: 'lyrics-playlist', params: { playlistId: props.playlist.id } });
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
          v-if="shouldShowViewMore"
          type="button"
          class="rounded-full border border-[#ffd7e8] bg-[#fff7fb] px-3 py-1.5 text-xs font-semibold text-[#c76a97] transition-colors hover:bg-[#ffeaf4]"
          @click="onViewMore"
        >
          View more
        </button>
      </div>
    </div>

    <div :class="layout === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4' : 'flex gap-3 overflow-x-auto pb-2'">
      <button
        v-for="song in visibleItems"
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
