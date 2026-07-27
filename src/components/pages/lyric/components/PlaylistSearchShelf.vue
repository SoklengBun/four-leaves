<script setup lang="ts">
import { useRouter } from 'vue-router';
import MarqueeText from '~/components/shares/MarqueeText.vue';

const props = defineProps<{
  playlists: Playlist[];
}>();

const router = useRouter();

const playlistInitial = (playlist: Playlist) => playlist.name.trim().slice(0, 1).toUpperCase() || '♪';

const playlistTileClass = (playlist: Playlist) => {
  const variants = [
    'from-primary-soft to-secondary-soft text-primary',
    'from-accent-soft to-primary-soft text-accent-strong',
    'from-secondary-soft to-accent-soft text-secondary',
    'from-surface-hover to-primary-soft text-primary',
  ];

  return variants[playlist.id % variants.length];
};

const onSelect = (playlist: Playlist) => {
  router.push({ name: 'lyrics-playlist', params: { playlistId: playlist.id } });
};
</script>

<template>
  <section v-if="props.playlists.length" class="space-y-3">
    <div class="flex items-end justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Curated collections</p>
        <h2 class="mt-1 text-lg font-semibold text-foreground md:text-xl">Playlists</h2>
      </div>
      <span class="shrink-0 text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
        {{ props.playlists.length }} playlists
      </span>
    </div>

    <div class="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
      <button
        v-for="playlist in props.playlists"
        :key="playlist.id"
        type="button"
        class="group flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-card-hover active:scale-[0.985] md:rounded-[22px] md:p-3.5"
        @click="onSelect(playlist)"
      >
        <span
          :class="[
            'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold shadow-sm',
            playlistTileClass(playlist),
          ]"
        >
          {{ playlistInitial(playlist) }}
        </span>

        <div class="min-w-0 flex-1">
          <MarqueeText :text="playlist.name" class="text-sm font-semibold text-foreground md:text-base" :gap="22" :speed="30" />
          <p class="mt-1 truncate text-xs text-foreground-muted">
            {{ playlist.description || 'A collection of songs' }}
          </p>
          <p class="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
            {{ playlist.items.length }} songs
          </p>
        </div>

        <span class="shrink-0 text-lg text-foreground-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true">
          →
        </span>
      </button>
    </div>
  </section>
</template>
