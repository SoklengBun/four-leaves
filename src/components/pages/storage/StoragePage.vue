<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

type StorageItem = {
  key: string;
  value: string;
  bytes: number;
};

const items = ref<StorageItem[]>([]);
const storageAvailable = ref(true);
const lastUpdated = ref<Date | null>(null);

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  const fractionDigits = unitIndex === 0 ? 0 : value < 10 ? 2 : 1;

  return `${value.toFixed(fractionDigits)} ${units[unitIndex]}`;
};

const readStorage = () => {
  try {
    const nextItems: StorageItem[] = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key === null) continue;

      const value = window.localStorage.getItem(key) ?? '';
      // localStorage stores DOMStrings, so two bytes per UTF-16 code unit is a useful estimate.
      const bytes = (key.length + value.length) * 2;
      nextItems.push({ key, value, bytes });
    }

    items.value = nextItems.sort((first, second) => second.bytes - first.bytes);
    storageAvailable.value = true;
  } catch {
    items.value = [];
    storageAvailable.value = false;
  }

  lastUpdated.value = new Date();
};

const clearItem = (key: string) => {
  try {
    window.localStorage.removeItem(key);
    readStorage();
  } catch {
    storageAvailable.value = false;
    lastUpdated.value = new Date();
  }
};

const totalBytes = computed(() => items.value.reduce((total, item) => total + item.bytes, 0));
const largestItem = computed(() => items.value[0] ?? null);
const updatedLabel = computed(() => {
  if (!lastUpdated.value) return '';

  return lastUpdated.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

const onStorageChange = (event: StorageEvent) => {
  if (event.storageArea === window.localStorage) readStorage();
};

onMounted(() => {
  readStorage();
  window.addEventListener('storage', onStorageChange);
});

onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorageChange);
});
</script>

<template>
  <div class="h-body overflow-auto px-4 py-6 pb-player md:px-8 md:py-10">
    <div class="mx-auto w-full max-w-[960px]">
      <header class="mb-8 flex items-start justify-between gap-4">
        <div>
          <p class="mb-1 text-sm text-primary">Browser data</p>
          <h1 class="text-3xl font-bold text-foreground md:text-4xl">Local storage</h1>
          <p class="mt-2 max-w-[620px] text-base text-foreground-muted">See how much data this app keeps in your browser, organized by key.</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-full border border-[#d8c8f1] bg-surface px-4 py-2 text-sm font-bold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary active:translate-y-0"
          @click="readStorage"
        >
          Refresh
        </button>
      </header>

      <div v-if="!storageAvailable" class="mb-5 rounded-2xl border border-[#f3b9d1] bg-card px-5 py-4 text-primary shadow-sm">
        Local storage is unavailable or access was denied by the browser.
      </div>

      <section class="mb-5 grid gap-4 sm:grid-cols-3">
        <div
          class="rounded-3xl border border-[#f0d8e8] bg-gradient-to-br from-[#ffffff] to-[#fff1f7] p-5 shadow-[0_10px_30px_#c8a3c52e] dark:from-[#2c2242] dark:to-[#251d3a]"
        >
          <p class="text-sm text-foreground-muted">Estimated usage</p>
          <p class="mt-2 text-3xl font-bold tabular-nums text-foreground">{{ formatBytes(totalBytes) }}</p>
          <p class="mt-1 text-xs text-foreground-muted">{{ totalBytes.toLocaleString() }} bytes</p>
        </div>
        <div
          class="rounded-3xl border border-[#f0d8e8] bg-gradient-to-br from-[#ffffff] to-[#f7f4ff] p-5 shadow-[0_10px_30px_#c8a3c52e] dark:from-[#2c2242] dark:to-[#251d3a]"
        >
          <p class="text-sm text-foreground-muted">Stored keys</p>
          <p class="mt-2 text-3xl font-bold tabular-nums text-foreground">{{ items.length }}</p>
          <p class="mt-1 text-xs text-foreground-muted">Across this origin</p>
        </div>
        <div
          class="rounded-3xl border border-[#f0d8e8] bg-gradient-to-br from-[#ffffff] to-[#eef8ff] p-5 shadow-[0_10px_30px_#c8a3c52e] dark:from-[#2c2242] dark:to-[#251d3a]"
        >
          <p class="text-sm text-foreground-muted">Largest key</p>
          <p class="mt-2 truncate text-xl font-bold text-foreground" :title="largestItem?.key || 'None'">
            {{ largestItem?.key || 'None' }}
          </p>
          <p class="mt-1 text-xs text-foreground-muted">{{ largestItem ? formatBytes(largestItem.bytes) : '0 B' }}</p>
        </div>
      </section>

      <section class="overflow-hidden rounded-3xl border border-[#f0d8e8] bg-surface shadow-[0_10px_30px_#c8a3c52e] dark:border-[#3d2f58]">
        <div class="flex items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
          <div>
            <h2 class="text-xl font-bold text-foreground">Stored data</h2>
            <p class="mt-1 text-sm text-foreground-muted">Sorted from largest to smallest.</p>
          </div>
          <span v-if="updatedLabel" class="shrink-0 text-xs text-foreground-muted">Updated {{ updatedLabel }}</span>
        </div>

        <div v-if="items.length" class="divide-y divide-border">
          <div v-for="item in items" :key="item.key" class="px-5 py-4 md:px-6">
            <div class="flex items-start gap-3">
              <div class="min-w-0 flex-1">
                <p class="break-all font-bold text-foreground">{{ item.key }}</p>
                <p class="mt-2 max-h-12 overflow-hidden break-all text-xs text-foreground-muted">{{ item.value || 'Empty value' }}</p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <span class="rounded-full bg-soft-pink px-3 py-1 text-xs font-bold tabular-nums text-primary">
                  {{ formatBytes(item.bytes) }}
                </span>
                <button
                  type="button"
                  class="rounded-full border border-[#f3b9d1] px-3 py-1 text-xs font-bold text-primary transition hover:bg-[#fff1f7] active:scale-95"
                  :aria-label="`Clear ${item.key}`"
                  @click="clearItem(item.key)"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="px-5 py-12 text-center md:px-6">
          <p class="text-lg font-bold text-foreground">No local storage data yet</p>
          <p class="mt-1 text-sm text-foreground-muted">Keys created by this app will appear here.</p>
        </div>

        <p class="border-t border-border px-5 py-4 text-xs text-foreground-muted md:px-6">
          Size is an estimate based on each key and value’s UTF-16 representation. Browser quota is managed separately by each browser.
        </p>
      </section>
    </div>
  </div>
</template>
