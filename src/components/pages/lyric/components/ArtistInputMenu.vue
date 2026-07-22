<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import showToast from '~/utils/toast';

type Artist = {
  id: number;
  name: string;
  altName?: string;
  cv?: {
    id?: number;
    name: string;
    altName?: string;
  } | null;
};

const props = defineProps<{
  modelValue: Artist[];
  search: (query: string) => Promise<Artist[]>;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Artist[]];
}>();

const rootRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const query = ref('');
const results = ref<Artist[]>([]);
const isOpen = ref(false);
const isSearching = ref(false);
const activeIndex = ref(0);

let searchTimer: ReturnType<typeof setTimeout> | null = null;
let searchSequence = 0;

const searchDelayMs = 2000;

const selectedIds = computed(() => props.modelValue.map((artist) => artist.id));
const selectableResults = computed(() => results.value.filter((artist) => !selectedIds.value.includes(artist.id)));

const secondaryName = (artist: Artist) => (artist.altName && artist.altName !== artist.name ? artist.altName : '');
const displayName = (artist: Artist) => {
  const altName = secondaryName(artist);
  return altName ? `${artist.name} / ${altName}` : artist.name;
};
const cvName = (artist: Artist) => {
  if (!artist.cv?.name) return '';

  const altName = artist.cv.altName && artist.cv.altName !== artist.cv.name ? ` / ${artist.cv.altName}` : '';
  return `CV: ${artist.cv.name}${altName}`;
};

const focusInput = () => {
  if (props.disabled) return;

  isOpen.value = true;
  inputRef.value?.focus();
};

const removeArtist = (id: number) => {
  emit(
    'update:modelValue',
    props.modelValue.filter((artist) => artist.id !== id),
  );
};

const selectArtist = (artist: Artist) => {
  if (selectedIds.value.includes(artist.id)) return;

  emit('update:modelValue', [...props.modelValue, artist]);
  query.value = '';
  results.value = [];
  activeIndex.value = 0;
  isOpen.value = false;
  inputRef.value?.focus();
};

const runSearch = async (value: string) => {
  const searchText = value.trim();
  const sequence = ++searchSequence;

  if (searchText.length < 2) {
    results.value = [];
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  isOpen.value = true;
  try {
    const nextResults = await props.search(searchText);
    if (sequence !== searchSequence || searchText !== query.value.trim()) return;

    results.value = nextResults;
    activeIndex.value = 0;
  } catch (err: any) {
    if (sequence !== searchSequence) return;

    showToast({ message: err?.message || 'Artist search failed', type: 'error' });
    results.value = [];
  } finally {
    if (sequence === searchSequence) isSearching.value = false;
  }
};

watch(query, (value) => {
  if (searchTimer) clearTimeout(searchTimer);

  const searchText = value.trim();
  searchSequence++;

  if (searchText.length < 2) {
    results.value = [];
    isSearching.value = false;
    return;
  }

  isOpen.value = true;
  isSearching.value = true;
  searchTimer = setTimeout(() => {
    runSearch(value);
  }, searchDelayMs);
});

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !query.value && props.modelValue.length) {
    removeArtist(props.modelValue[props.modelValue.length - 1].id);
    return;
  }

  if (event.key === 'Escape') {
    isOpen.value = false;
    return;
  }

  if (!isOpen.value || !selectableResults.value.length) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % selectableResults.value.length;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + selectableResults.value.length) % selectableResults.value.length;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    selectArtist(selectableResults.value[activeIndex.value]);
  }
};

const onDocumentPointerDown = (event: PointerEvent) => {
  if (!rootRef.value?.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <div
      class="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none transition focus-within:border-primary focus-within:bg-card focus-within:ring-4 focus-within:ring-primary-soft md:py-2"
      :class="{ 'cursor-not-allowed opacity-60': disabled }"
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="focusInput"
    >
      <span
        v-for="artist in modelValue"
        :key="artist.id"
        class="inline-flex max-w-full items-center gap-1 rounded-md bg-primary-soft px-1.5 py-1 text-primary md:px-2.5 md:py-1.5"
      >
        <div class="flex min-w-0 items-center space-x-2">
          <span class="block truncate text-xs font-semibold md:text-sm">{{ displayName(artist) }}</span>
          <span v-if="cvName(artist)" class="block truncate text-[10px] font-medium text-foreground-muted md:text-xs">({{ cvName(artist) }})</span>
        </div>
        <button
          type="button"
          class="grid size-4 shrink-0 place-items-center rounded text-xs font-semibold text-primary transition hover:bg-surface-hover md:text-sm"
          :aria-label="`Remove ${artist.name}`"
          @click.stop="removeArtist(artist.id)"
        >
          x
        </button>
      </span>

      <input
        ref="inputRef"
        v-model="query"
        :disabled="disabled"
        :placeholder="modelValue.length ? '' : placeholder || 'Search artists'"
        class="h-7 min-w-[40px] flex-1 bg-transparent px-1 text-foreground outline-none placeholder:text-foreground-subtle disabled:cursor-not-allowed"
        @focus="isOpen = true"
        @keydown="onKeydown"
      />
    </div>

    <div
      v-if="isOpen && query.trim().length >= 2"
      class="absolute left-0 right-0 z-30 mt-2 max-h-56 overflow-auto rounded-lg border border-border bg-card py-1 text-foreground shadow-card"
      role="listbox"
    >
      <p v-if="isSearching" class="px-3 py-2 text-sm text-foreground-muted">Searching...</p>
      <button
        v-for="(artist, index) in selectableResults"
        :key="artist.id"
        type="button"
        class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-surface-hover"
        :class="{ 'bg-surface': index === activeIndex }"
        role="option"
        @mousedown.prevent="selectArtist(artist)"
      >
        <span class="block truncate font-medium">{{ displayName(artist) }}</span>
        <span v-if="cvName(artist)" class="block truncate text-xs text-foreground-muted">({{ cvName(artist) }})</span>
      </button>
      <p v-if="!isSearching && !selectableResults.length" class="px-3 py-2 text-sm text-foreground-muted">No matches</p>
    </div>
  </div>
</template>
