<script setup lang="ts">
import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { getLyricsTitleLabel, getLyricsArtistsLabel } from '~/utils/lyrics';

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    songs: PlaylistItem[];
    layout?: 'row' | 'grid';
  }>(),
  {
    layout: 'row',
  },
);

const emit = defineEmits<{
  select: [song: PlaylistItem];
}>();

const onSelect = (song: PlaylistItem) => {
  emit('select', song);
};
</script>

<template>
  <section v-if="songs.length" class="space-y-3">
    <div class="flex items-end justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-lg font-semibold text-[#2b1f28] md:text-xl">{{ title }}</h2>
        <p v-if="description" class="mt-1 text-xs text-[#7f6675] md:text-sm">{{ description }}</p>
      </div>
      <p class="shrink-0 text-xs font-medium uppercase tracking-[0.24em] text-[#d184ad]">{{ songs.length }} songs</p>
    </div>

    <div :class="layout === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4' : 'flex gap-3 overflow-x-auto pb-2'">
      <button
        v-for="song in songs"
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
          <YoutubeThumbnail :id="song.videoId" />
        </div>

        <div class="mt-3 min-w-0">
          <MarqueeText :text="getLyricsTitleLabel(song)" class="text-sm font-semibold text-[#2b1f28] md:text-base" :gap="28" />
          <MarqueeText
            :text="getLyricsArtistsLabel(song.artists) || 'Unknown artist'"
            class="mt-1 text-xs text-[#816776] md:text-sm"
            :gap="24"
            :speed="32"
          />
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
