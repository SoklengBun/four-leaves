<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Loading from '~/components/shares/Loading.vue';

export type LyricsSearchType = 'all' | 'song' | 'artist' | 'playlist';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    searchType: LyricsSearchType;
    loading?: boolean;
  }>(),
  { loading: false },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:searchType': [value: LyricsSearchType];
  clear: [];
}>();

const searchTypeOptions: Array<{ value: LyricsSearchType; label: string }> = [
  { value: 'all', label: 'Everything' },
  { value: 'song', label: 'Songs' },
  { value: 'artist', label: 'Artists' },
  { value: 'playlist', label: 'Playlists' },
];

const typeMenuRef = ref<HTMLElement | null>(null);
const isTypeMenuOpen = ref(false);
const selectedSearchTypeLabel = computed(() => {
  return searchTypeOptions.find((option) => option.value === props.searchType)?.label ?? 'Everything';
});

const selectSearchType = (value: LyricsSearchType) => {
  emit('update:searchType', value);
  isTypeMenuOpen.value = false;
};

const onDocumentClick = (event: MouseEvent) => {
  if (!typeMenuRef.value?.contains(event.target as Node)) {
    isTypeMenuOpen.value = false;
  }
};

const onTypeMenuKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isTypeMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onTypeMenuKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onTypeMenuKeydown);
});
</script>

<template>
  <div class="flex w-full items-center rounded-md border border-border bg-card shadow-sm md:rounded-lg">
    <span class="pl-3 text-xl leading-none text-foreground-muted md:pl-4 md:text-2xl" aria-hidden="true">⌕</span>

    <input
      :value="props.modelValue"
      type="text"
      placeholder="Search songs, artists, or playlists"
      aria-label="Search songs, artists, or playlists"
      class="min-w-0 flex-1 bg-transparent p-2 text-sm text-foreground outline-none placeholder:text-rose-300/40 md:p-3 md:text-base"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <Loading class="mr-2 text-base md:text-lg" :class="{ 'opacity-0': !props.loading }" />

    <button
      v-if="props.modelValue"
      type="button"
      class="mr-1 rounded-full px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft md:mr-2 md:text-sm"
      @click="emit('clear')"
    >
      Clear
    </button>

    <div class="h-7 w-px shrink-0 bg-border" aria-hidden="true" />

    <div ref="typeMenuRef" class="relative flex shrink-0 items-center">
      <span class="sr-only">Search type</span>
      <button
        type="button"
        class="flex max-w-[8.5rem] items-center gap-1 bg-transparent py-2 pl-2 pr-2 text-xs font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary md:max-w-none md:gap-2 md:py-3 md:pl-3 md:pr-3 md:text-sm"
        aria-haspopup="listbox"
        :aria-expanded="isTypeMenuOpen"
        aria-label="Search type"
        @click="isTypeMenuOpen = !isTypeMenuOpen"
      >
        <span class="truncate">{{ selectedSearchTypeLabel }}</span>
        <span class="text-[0.65rem] text-foreground-muted transition-transform duration-200" :class="{ 'rotate-180': isTypeMenuOpen }" aria-hidden="true">⌄</span>
      </button>

      <div
        v-if="isTypeMenuOpen"
        class="absolute left-auto right-0 top-full z-30 mt-2 min-w-[10.5rem] origin-top-right overflow-hidden rounded-lg border border-border bg-card p-1 shadow-card md:rounded-xl md:p-1.5"
        role="listbox"
        aria-label="Search type options"
      >
        <button
          v-for="option in searchTypeOptions"
          :key="option.value"
          type="button"
          role="option"
          :aria-selected="props.searchType === option.value"
          class="flex w-full items-center justify-between gap-4 rounded-md px-3 py-2 text-left text-xs font-semibold text-foreground-muted transition-colors hover:bg-card-hover hover:text-foreground md:rounded-lg md:text-sm"
          :class="{ 'bg-primary-soft text-primary': props.searchType === option.value }"
          @click="selectSearchType(option.value)"
        >
          <span>{{ option.label }}</span>
          <span v-if="props.searchType === option.value" aria-hidden="true">✓</span>
        </button>
      </div>
    </div>
  </div>
</template>
