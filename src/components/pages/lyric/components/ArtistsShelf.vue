<script setup lang="ts">
import { useRouter } from 'vue-router';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import IconChevronRight from '~/components/icons/IconChevronRight.vue';

const props = defineProps<{
  artists: LyricsArtist[];
}>();

const router = useRouter();

const artistInitial = (artist: LyricsArtist) => {
  const name = artist.name.trim();
  return name.slice(0, 2) || '?';
};

const artistTileClass = (artist: LyricsArtist) => {
  const variants = [
    'from-primary-soft to-secondary-soft text-primary',
    'from-accent-soft to-primary-soft text-accent-strong',
    'from-secondary-soft to-accent-soft text-secondary',
    'from-surface-hover to-primary-soft text-primary',
  ];

  return variants[artist.id % variants.length];
};

const onSelect = (artist: LyricsArtist) => {
  router.push({ name: 'lyrics-artist', params: { artistId: artist.id } });
};
</script>

<template>
  <section v-if="props.artists.length" class="space-y-3">
    <div class="flex items-end justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Voices behind the songs</p>
        <h2 class="mt-1 text-lg font-semibold text-foreground md:text-xl">Artists</h2>
      </div>
      <span class="shrink-0 text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">{{ props.artists.length }} artists</span>
    </div>

    <div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
      <button
        v-for="artist in props.artists"
        :key="artist.id"
        type="button"
        class="group flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-card-hover active:scale-[0.985] md:rounded-[22px] md:p-3.5"
        @click="onSelect(artist)"
      >
        <span
          :class="[
            'flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold tracking-tight shadow-sm md:size-12',
            artistTileClass(artist),
          ]"
        >
          {{ artistInitial(artist) }}
        </span>

        <div class="min-w-0 flex-1">
          <MarqueeText :text="artist.name" class="text-sm font-semibold text-foreground md:text-base" :gap="22" :speed="30" />
          <MarqueeText
            :text="artist.altName || 'Browse songs'"
            class="mt-0.5 text-xs text-foreground-muted"
            :gap="18"
            :speed="26"
          />
        </div>

        <IconChevronRight
          class="size-5 shrink-0 text-foreground-subtle transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </button>
    </div>
  </section>
</template>
