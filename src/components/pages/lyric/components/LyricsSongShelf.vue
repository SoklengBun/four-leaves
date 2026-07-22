<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';
import LazyRender from '~/components/shares/LazyRender.vue';
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
const isGridLayout = computed(() => props.layout === 'grid');

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
        <h2 class="text-lg font-semibold text-foreground md:text-xl">{{ playlist.name }}</h2>
        <p v-if="playlist.description" class="mt-1 text-xs text-foreground-muted md:text-sm">{{ playlist.description }}</p>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <p class="text-xs font-medium uppercase tracking-[0.24em] text-primary">{{ playlist.items.length }} songs</p>
        <button
          v-if="shouldShowViewMore"
          type="button"
          class="rounded-full border border-border bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-card-hover"
          @click="onViewMore"
        >
          View more
        </button>
      </div>
    </div>

    <div :class="layout === 'grid' ? 'grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3' : 'flex gap-3 overflow-x-auto pb-2'">
      <button
        v-for="song in visibleItems"
        :key="song.id"
        type="button"
        :class="
          layout === 'grid'
            ? 'box-cover group w-full min-w-0 rounded-xl p-2.5 text-left transition-all duration-300 [background:var(--gradient-surface)] [contain-intrinsic-size:220px] [content-visibility:auto] hover:-translate-y-1 active:scale-[0.985] md:rounded-2xl'
            : 'box-cover group w-[132px] shrink-0 rounded-[24px] p-2.5 text-left transition-all duration-300 [background:var(--gradient-surface)] hover:-translate-y-1 active:scale-[0.985] md:w-[164px]'
        "
        @click="onSelect(song)"
      >
        <LazyRender class="block">
          <div class="relative aspect-square overflow-hidden rounded-md bg-surface-hover md:rounded-lg">
            <YoutubeThumbnail :id="getThumbnailId(song)" />
          </div>

          <div class="mt-3 min-w-0">
            <MarqueeText :text="getLyricsTitleLabel(song)" class="text-sm font-semibold text-foreground md:text-base" :gap="28" />

            <MarqueeText
              :text="getCoverArtistsLabel(song) || 'Unknown artist'"
              class="mt-1 text-xs text-foreground-muted md:text-sm"
              :gap="24"
              :speed="32"
            />
          </div>

          <template #placeholder>
            <div class="relative aspect-square overflow-hidden rounded-md bg-surface-hover md:rounded-lg">
              <div class="size-full animate-pulse bg-surface"></div>
            </div>

            <div class="mt-3 space-y-2">
              <div class="h-4 rounded-full bg-surface-hover"></div>
              <div class="h-3 w-2/3 rounded-full bg-border"></div>
            </div>
          </template>
        </LazyRender>
      </button>
    </div>
  </section>
</template>
