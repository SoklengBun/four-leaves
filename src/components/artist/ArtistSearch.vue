<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import useAppFetch from '~/services';

type Artist = { id: number; name: string; normalizedName?: string };

const props = defineProps<{
  modelValue?: number[];
  knownArtists?: Artist[];
  placeholder?: string;
  // debounce delay in ms after last keystroke (default: 300)
  releaseDelayMs?: number;
}>();

const emit = defineEmits(['update:modelValue', 'select']);

const query = ref('');
const results = ref<Artist[]>([]);
const isLoading = ref(false);
const waiting = ref(false);
const error = ref<string | null>(null);
const isFocused = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const highlighted = ref(-1);
let timer: number | null = null;

const selectedIds = computed(() => props.modelValue || []);

const knownMap = computed(() => {
  const m = new Map<number, Artist>();
  (props.knownArtists || []).forEach((a) => m.set(a.id, a));
  return m;
});

const displayName = (id: number) => knownMap.value.get(id)?.name || id.toString();

const doSearch = async (q: string) => {
  if (!q || q.trim().length === 0) {
    results.value = [];
    error.value = null;
    isLoading.value = false;
    waiting.value = false;
    return;
  }
  waiting.value = false;
  isLoading.value = true;
  error.value = null;
  try {
    const endpoint = `artist/search?q=${encodeURIComponent(q)}`;
    const { data } = await useAppFetch(endpoint).get().json();
    if (data && data.value && data.value.code === 0 && Array.isArray(data.value.data)) {
      results.value = (data.value.data as Artist[]).slice(0, 20);
    } else {
      results.value = [];
      error.value = data?.value?.message || 'No results';
    }
  } catch (e: any) {
    results.value = [];
    error.value = e?.message || 'Network error';
  } finally {
    isLoading.value = false;
    highlighted.value = results.value.length ? 0 : -1;
  }
};

watch(query, (q) => {
  const delay = typeof props.releaseDelayMs === 'number' ? props.releaseDelayMs : 300;
  if (timer) window.clearTimeout(timer);
  if (!q || q.trim().length === 0) {
    waiting.value = false;
    results.value = [];
    return;
  }
  // show waiting state between release and fetch
  waiting.value = true;
  timer = window.setTimeout(() => doSearch(q), delay);
});

const visibleList = computed(() => {
  return isFocused.value && (waiting.value || isLoading.value || results.value.length > 0 || !!error.value);
});

onMounted(() => {
  const onDocClick = (e: MouseEvent) => {
    const el = rootRef.value;
    if (!el) return;
    if (!el.contains(e.target as Node)) {
      isFocused.value = false;
    }
  };
  document.addEventListener('click', onDocClick);
  onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
});

const toggleSelect = (a: Artist) => {
  const ids = Array.from(selectedIds.value || []);
  const idx = ids.indexOf(a.id);
  if (idx === -1) ids.push(a.id);
  else ids.splice(idx, 1);
  emit('update:modelValue', ids);
  emit('select', a);
};

const removeId = (id: number) => {
  const ids = Array.from(selectedIds.value || []);
  const idx = ids.indexOf(id);
  if (idx !== -1) {
    ids.splice(idx, 1);
    emit('update:modelValue', ids);
  }
};

const router = useRouter();
const openArtist = (id: number) => {
  // optional: navigate to artist detail page
  router.push({ path: `/artist/${id}` }).catch(() => {});
};

const onInputKey = (e: KeyboardEvent) => {
  if (!visibleList.value) return;
  if (e.key === 'ArrowDown') {
    highlighted.value = Math.min(highlighted.value + 1, results.value.length - 1);
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    highlighted.value = Math.max(highlighted.value - 1, 0);
    e.preventDefault();
  } else if (e.key === 'Enter') {
    if (highlighted.value >= 0 && results.value[highlighted.value]) {
      toggleSelect(results.value[highlighted.value]);
      e.preventDefault();
    }
  } else if (e.key === 'Escape') {
    isFocused.value = false;
  }
};
</script>

<template>
  <div class="w-full" ref="rootRef">
    <div class="flex flex-wrap gap-2">
      <template v-for="id in selectedIds" :key="id">
        <span class="inline-flex items-center gap-2 rounded bg-gray-100 px-2 py-1 text-sm">
          <span class="text-sm">{{ displayName(id) }}</span>
          <button type="button" @click="removeId(id)" class="text-muted-foreground">✕</button>
        </span>
      </template>
    </div>

    <div class="relative mt-2">
      <input
        v-model="query"
        :placeholder="props.placeholder || 'Search artists'"
        @keydown="onInputKey"
        @focus="isFocused = true"
        class="w-full rounded border px-3 py-2"
      />

      <div class="absolute right-2 top-2 text-sm text-gray-500">
        <span v-if="waiting">Waiting…</span>
        <span v-else-if="isLoading">Searching…</span>
      </div>

      <div v-if="visibleList" class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow-sm">
        <div v-if="error" class="p-3 text-sm text-red-600">{{ error }}</div>
        <div v-else-if="!results.length && !isLoading" class="text-muted-foreground p-3 text-sm">No artists found</div>
        <template v-else>
          <ul>
            <li
              v-for="(a, idx) in results"
              :key="a.id"
              @click="toggleSelect(a)"
              @dblclick.stop="openArtist(a.id)"
              :class="['cursor-pointer px-3 py-2', highlighted === idx ? 'bg-indigo-50' : '']"
            >
              <div class="flex items-center justify-between">
                <div class="text-sm">{{ a.name }}</div>
                <div class="text-muted-foreground text-xs">{{ a.normalizedName || a.id }}</div>
              </div>
            </li>
          </ul>
          <div v-if="results.length >= 20" class="text-muted-foreground px-3 py-2 text-center text-sm">More results…</div>
        </template>
      </div>
    </div>
  </div>
</template>
