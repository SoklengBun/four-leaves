<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import ArtistInputMenu from './components/ArtistInputMenu.vue';
import useAppFetch from '~/services';
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

type CoverDraft = {
  id: string;
  artists: Artist[];
};

type ContentDraft = {
  kind: string;
  content: string;
};

type LyricsPayload = {
  videoId: string;
  title: string;
  altTitles: string[];
  artistIds: number[];
  covers: Array<{ id: string; artistIds: number[] }>;
  contents: ContentDraft[];
};

type LyricsPatch = Partial<LyricsPayload>;

const route = useRoute();
const router = useRouter();

const videoId = ref('');
const title = ref('');
const altTitles = ref<string[]>([]);
const artistIds = ref<number[]>([]);
const selectedArtists = ref<Artist[]>([]);
const artistNameById = ref<Record<number, string>>({});

const covers = ref<CoverDraft[]>([]);
const contents = ref<ContentDraft[]>([{ kind: '', content: '' }]);

const isSubmitting = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const originalPayload = ref<LyricsPayload | null>(null);

const contentKinds = ['japanese', 'romaji', 'english', 'translation'];
const legacyContentKinds: Record<string, string> = {
  jp: 'japanese',
  en: 'english',
};

const lyricId = ref(route.params.id?.toString() || '');
const isEditMode = computed(() => route.name === 'lyrics-edit' && Boolean(lyricId.value));

const cleanAltTitles = computed(() => altTitles.value.map((item) => item.trim()).filter(Boolean));
const cleanCovers = computed(() =>
  covers.value
    .map((cover) => ({
      id: extractYoutubeVideoId(cover.id),
      artistIds: cover.artists.map((artist) => artist.id),
    }))
    .filter((cover) => cover.id),
);

const normalizedPayload = computed<LyricsPayload>(() => ({
  videoId: videoId.value.trim(),
  title: title.value.trim(),
  altTitles: cleanAltTitles.value,
  artistIds: [...artistIds.value],
  covers: cleanCovers.value,
  contents: contents.value
    .map((item) => ({
      kind: item.kind.trim(),
      content: item.content.trim(),
    }))
    .filter((item) => item.kind && item.content),
}));

const normalizeForCompare = (value: unknown) => JSON.stringify(value);

const dirtyPatch = computed<LyricsPatch>(() => {
  if (!originalPayload.value) return {};

  const patch: LyricsPatch = {};
  const current = normalizedPayload.value;
  (Object.keys(current) as Array<keyof LyricsPayload>).forEach((key) => {
    if (normalizeForCompare(current[key]) !== normalizeForCompare(originalPayload.value?.[key])) {
      patch[key] = current[key] as never;
    }
  });

  return patch;
});

const isDirty = computed(() => {
  if (!isEditMode.value) {
    const payload = normalizedPayload.value;
    return Boolean(
      payload.videoId ||
        payload.title ||
        payload.altTitles.length ||
        payload.artistIds.length ||
        payload.covers.length ||
        payload.contents.length ||
        contents.value.some((item) => item.kind.trim() || item.content.trim()),
    );
  }

  return Boolean(Object.keys(dirtyPatch.value).length);
});

const extractYoutubeVideoId = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return '';

  const directId = trimmedValue.match(/^[\w-]{11}$/);
  if (directId) return trimmedValue;

  try {
    const url = new URL(trimmedValue);
    const videoParam = url.searchParams.get('v');
    if (videoParam?.match(/^[\w-]{11}$/)) return videoParam;

    const pathParts = url.pathname.split('/').filter(Boolean);
    const pathId = url.hostname.includes('youtu.be') ? pathParts[0] : pathParts.find((part) => part.match(/^[\w-]{11}$/));
    if (pathId?.match(/^[\w-]{11}$/)) return pathId;
  } catch {
    const videoParam = trimmedValue.match(/[?&]v=([\w-]{11})/);
    if (videoParam) return videoParam[1];

    const shortUrlId = trimmedValue.match(/youtu\.be\/([\w-]{11})/);
    if (shortUrlId) return shortUrlId[1];
  }

  return trimmedValue;
};

watch(videoId, (value) => {
  const detectedVideoId = extractYoutubeVideoId(value);
  if (detectedVideoId && detectedVideoId !== value) {
    videoId.value = detectedVideoId;
  }
});

const normalizeArtists = (payload: any): Artist[] => {
  const source = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

  return source
    .map((item: any) => ({
      id: Number(item.id),
      name: String(item.name || item.title || '').trim(),
      altName: String(item.altName || item.alt_name || '').trim() || undefined,
      cv: normalizeCv(item.cv),
    }))
    .filter((item: Artist) => Number.isFinite(item.id) && item.name);
};

const normalizeCv = (payload: any): Artist['cv'] => {
  if (!payload || typeof payload !== 'object') return null;

  const name = String(payload.name || payload.title || '').trim();
  if (!name) return null;

  return {
    id: Number.isFinite(Number(payload.id)) ? Number(payload.id) : undefined,
    name,
    altName: String(payload.altName || payload.alt_name || '').trim() || undefined,
  };
};

const normalizeArtistId = (value: any) => {
  const id = Number(typeof value === 'object' ? value?.id : value);
  return Number.isFinite(id) ? id : null;
};

const normalizeArtistList = (payload: any): Artist[] => {
  const source = Array.isArray(payload) ? payload : [];

  return source
    .map((item: any) => ({
      id: Number(item?.id ?? item?.artistId),
      name: String(item?.name ?? item?.artist?.name ?? item?.title ?? '').trim(),
      altName: String(item?.altName ?? item?.alt_name ?? item?.artist?.altName ?? item?.artist?.alt_name ?? '').trim() || undefined,
      cv: normalizeCv(item?.cv ?? item?.artist?.cv),
    }))
    .filter((item: Artist) => Number.isFinite(item.id));
};

const normalizeArtistIds = (payload: any): number[] => {
  const source = Array.isArray(payload) ? payload : [];
  return source.map(normalizeArtistId).filter((id): id is number => id !== null);
};

const searchArtists = async (keyword: string) => {
  const query = keyword.trim();
  if (query.length < 2) return [];

  const { data } = await useAppFetch(`artist/search?q=${encodeURIComponent(query)}`)
    .get()
    .json();
  if (data.value?.code !== undefined && data.value.code !== 0) {
    throw new Error(data.value?.message || 'Artist search failed');
  }

  return normalizeArtists(data.value?.data ?? data.value);
};

watch(
  selectedArtists,
  (artists) => {
    artistIds.value = artists.map((artist) => artist.id);
    artists.forEach((artist) => {
      artistNameById.value[artist.id] = artist.name;
    });
  },
  { deep: true },
);

watch(
  covers,
  (items) => {
    items.forEach((cover) => {
      cover.artists.forEach((artist) => {
        artistNameById.value[artist.id] = artist.name;
      });
    });
  },
  { deep: true },
);

const addAltTitle = () => altTitles.value.push('');
const removeAltTitle = (index: number) => altTitles.value.splice(index, 1);

const addCover = () => {
  covers.value.push({
    id: '',
    artists: [],
  });
};

const removeCover = (index: number) => covers.value.splice(index, 1);

const normalizeCoverVideoId = (cover: CoverDraft) => {
  const detectedVideoId = extractYoutubeVideoId(cover.id);
  if (detectedVideoId && detectedVideoId !== cover.id) {
    cover.id = detectedVideoId;
  }
};

const addContent = () => contents.value.push({ kind: '', content: '' });
const removeContent = (index: number) => contents.value.splice(index, 1);
const isContentKindUsed = (kind: string, currentIndex: number) =>
  contents.value.some((item, index) => index !== currentIndex && item.kind.trim() === kind);
const normalizeLyricContent = (value: string) => value.replace(/е/g, 'e');

const normalizeContents = (payload: any): ContentDraft[] => {
  if (Array.isArray(payload?.contents)) {
    return payload.contents
      .map((item: any) => ({
        kind: String(item.kind ?? item.type ?? item.language ?? '').trim(),
        content: String(item.content ?? item.text ?? item.value ?? '').trim(),
      }))
      .filter((item: ContentDraft) => item.kind || item.content);
  }

  return Object.entries(legacyContentKinds)
    .map(([sourceKey, kind]) => ({
      kind,
      content: String(payload?.[sourceKey] ?? '').trim(),
    }))
    .filter((item) => item.content);
};

const normalizeCovers = (payload: any): CoverDraft[] => {
  const source = Array.isArray(payload?.covers) ? payload.covers : [];

  return source
    .map((cover: any) => {
      const coverArtists = normalizeArtistList(cover.artists ?? cover.artist ?? []);
      const coverArtistIds = normalizeArtistIds(cover.artistIds ?? cover.artist_ids ?? coverArtists);
      const selectedCoverArtists = coverArtists.length
        ? coverArtists
        : coverArtistIds.map((id) => ({ id, name: artistNameById.value[id] || `Artist #${id}` }));

      selectedCoverArtists.forEach((artist) => {
        artistNameById.value[artist.id] = artist.name;
      });

      return {
        id: String(cover.videoId ?? cover.video_id ?? cover.youtubeId ?? cover.id ?? '').trim(),
        artists: selectedCoverArtists,
      };
    })
    .filter((cover: CoverDraft) => cover.id || cover.artists.length);
};

const applyLyricsPayload = (payload: any) => {
  const primaryTitle = Array.isArray(payload?.titles) ? payload.titles[0]?.title : payload?.title;
  const alternateTitles = Array.isArray(payload?.altTitles)
    ? payload.altTitles
    : Array.isArray(payload?.titles)
      ? payload.titles.slice(1).map((item: any) => item?.title)
      : [];
  const artists = normalizeArtistList(payload?.artists ?? []);
  artistNameById.value = {};
  artists.forEach((artist) => {
    artistNameById.value[artist.id] = artist.name;
  });
  const payloadArtistIds = normalizeArtistIds(payload?.artistIds ?? payload?.artist_ids ?? artists);
  lyricId.value = payload?.id;
  videoId.value = String(payload?.videoId ?? payload?.video_id ?? payload?.youtubeId ?? payload?.url ?? '').trim();
  title.value = String(primaryTitle ?? '').trim();
  altTitles.value = alternateTitles.map((item: any) => String(item ?? '').trim()).filter(Boolean);
  selectedArtists.value = artists.length ? artists : payloadArtistIds.map((id) => ({ id, name: `Artist #${id}` }));
  artistIds.value = payloadArtistIds;
  contents.value = normalizeContents(payload);
  if (!contents.value.length) contents.value = [{ kind: '', content: '' }];
  covers.value = normalizeCovers(payload);

  originalPayload.value = normalizedPayload.value;
};

const fetchLyricsForEdit = async () => {
  if (!isEditMode.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    const { data } = await useAppFetch(`lyrics/${encodeURIComponent(lyricId.value)}`)
      .get()
      .json();

    if (data.value?.code === 0) {
      applyLyricsPayload(data.value.data);
      return;
    }

    const message = data.value?.message || 'Failed to load lyrics';
    error.value = message;
    showToast({ message, type: 'error' });
    router.push({ name: 'lyrics-add' });
  } catch {
    error.value = 'Network error while loading lyrics';
    showToast({ message: error.value, type: 'error' });
  } finally {
    isLoading.value = false;
  }
};

const validate = () => {
  const trimmedTitle = title.value.trim();
  const trimmedVideoId = videoId.value.trim();

  if (!trimmedVideoId) {
    error.value = 'Video ID is required';
    showToast({ message: error.value, type: 'error' });
    return false;
  }

  if (!trimmedTitle) {
    error.value = 'Title is required';
    showToast({ message: error.value, type: 'error' });
    return false;
  }

  if (!artistIds.value.length) {
    error.value = 'Select at least one artist';
    showToast({ message: error.value, type: 'error' });
    return false;
  }

  const filledContents = contents.value.filter((item) => item.kind.trim() || item.content.trim());
  if (!filledContents.length || filledContents.some((item) => !item.kind.trim() || !item.content.trim())) {
    error.value = 'Each lyric block needs a kind and content';
    showToast({ message: error.value, type: 'error' });
    return false;
  }

  const duplicateKinds = filledContents.map((item) => item.kind.trim()).filter((kind, index, kinds) => kinds.indexOf(kind) !== index);
  if (duplicateKinds.length) {
    error.value = `A lyric kind/language can only be used once: ${[...new Set(duplicateKinds)].join(', ')}`;
    showToast({ message: error.value, type: 'error' });
    return false;
  }

  error.value = null;
  return true;
};

const onSubmit = async () => {
  if (!validate()) return;

  const payload = isEditMode.value ? dirtyPatch.value : normalizedPayload.value;

  if (isEditMode.value && !Object.keys(payload).length) {
    showToast({ message: 'No changes to save', type: 'warning' });
    return;
  }

  isSubmitting.value = true;
  try {
    const request = isEditMode.value
      ? useAppFetch(`lyrics/${encodeURIComponent(lyricId.value)}`).put(payload)
      : useAppFetch('lyrics/add').post(payload);
    const { data } = await request.json();
    if (data.value?.code === 0) {
      originalPayload.value = normalizedPayload.value;
      showToast({ message: isEditMode.value ? 'Lyrics updated' : 'Lyrics added', type: 'success' });
      router.replace({ name: 'lyrics-detail', params: { id: data.value.data.videoId } }).catch(() => {});
      return;
    }

    const message = data.value?.message || (isEditMode.value ? 'Failed to update lyrics' : 'Failed to add lyrics');
    error.value = message;
    showToast({ message, type: 'error' });
  } catch (err) {
    error.value = isEditMode.value ? 'Network error while updating lyrics' : 'Network error while adding lyrics';
    showToast({ message: error.value, type: 'error' });
  } finally {
    isSubmitting.value = false;
  }
};

const confirmLeave = () => !isDirty.value || window.confirm('You have unsaved lyric changes. Leave this page?');

const onBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!isDirty.value) return;

  event.preventDefault();
  event.returnValue = '';
};

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload);
  if (isEditMode.value) {
    fetchLyricsForEdit();
  } else {
    originalPayload.value = normalizedPayload.value;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload);
});

onBeforeRouteLeave(() => confirmLeave());
</script>

<template>
  <div class="min-h-[calc(var(--body-height))] bg-background text-foreground">
    <div class="px-3 py-4">
      <form @submit.prevent="onSubmit" class="grid gap-4">
        <section class="sticky top-4 z-20 rounded-lg border border-border bg-card p-4 shadow-card">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{{ isEditMode ? 'edit lyric' : 'new lyric' }}</p>
              <h1 class="mt-1 text-2xl font-bold text-foreground">
                {{ isEditMode ? 'Edit this soft little lyric' : 'Add a soft little lyric' }}
              </h1>
            </div>
            <button
              type="submit"
              :disabled="isSubmitting || isLoading"
              class="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-primary transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isSubmitting ? 'Saving...' : isEditMode ? 'Update lyric' : 'Save lyric' }}
            </button>
          </div>
        </section>

        <section v-if="isLoading" class="rounded-lg border border-border bg-card p-4 text-sm font-semibold text-foreground-muted shadow-sm">
          Loading lyric...
        </section>

        <section class="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div class="grid gap-3 md:grid-cols-2">
            <label class="block">
              <span class="text-sm font-semibold text-foreground">Video ID</span>
              <input
                v-model="videoId"
                class="mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition placeholder:text-foreground-subtle focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary-soft"
                placeholder="youtube video ID, e.g: 84YBqfpCGW8 or paste the youtube link here"
              />
            </label>
            <label class="block">
              <span class="text-sm font-semibold text-foreground">Title</span>
              <input
                v-model="title"
                class="mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition placeholder:text-foreground-subtle focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary-soft"
                placeholder="Song title"
              />
            </label>
          </div>

          <div class="mt-4">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-foreground">Alt titles</span>
              <button
                type="button"
                @click="addAltTitle"
                class="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft"
              >
                Add
              </button>
            </div>
            <div class="mt-2 space-y-2">
              <div v-for="(_, index) in altTitles" :key="index" class="flex gap-2">
                <input
                  v-model="altTitles[index]"
                  class="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary-soft"
                  placeholder="Alternative title"
                />
                <button
                  type="button"
                  @click="removeAltTitle(index)"
                  class="rounded-lg border border-danger px-3 text-xs font-semibold text-danger transition hover:bg-surface-hover"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-bold text-foreground">Artists</h2>
            <span class="rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{{ artistIds.length }} selected</span>
          </div>

          <div class="mt-3">
            <ArtistInputMenu v-model="selectedArtists" :search="searchArtists" :disabled="isLoading" placeholder="Search and select artists" />
          </div>
        </section>

        <section class="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-bold text-foreground">Lyrics</h2>
            <button
              type="button"
              @click="addContent"
              class="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-soft"
            >
              Add block
            </button>
          </div>

          <div class="mt-3 space-y-3">
            <div v-for="(content, index) in contents" :key="index" class="rounded-lg border border-border bg-surface p-3">
              <div class="flex items-center gap-2">
                <select
                  v-model="content.kind"
                  class="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-soft sm:w-48"
                >
                  <option value="">Kind</option>
                  <option v-for="kind in contentKinds" :key="kind" :value="kind" :disabled="isContentKindUsed(kind, index)">
                    {{ kind }}
                  </option>
                </select>
                <button
                  type="button"
                  @click="removeContent(index)"
                  class="ml-auto h-10 rounded-lg border border-danger px-3 text-xs font-semibold text-danger transition hover:bg-surface-hover"
                >
                  Remove
                </button>
              </div>
              <textarea
                v-model="content.content"
                @input="content.content = normalizeLyricContent(content.content)"
                rows="9"
                class="mt-3 w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none transition placeholder:text-foreground-subtle focus:border-primary focus:ring-4 focus:ring-primary-soft"
                placeholder="Paste lyrics here"
              ></textarea>
            </div>
          </div>
        </section>

        <aside class="space-y-4 lg:sticky lg:top-[calc(var(--nav-height)+1rem)] lg:self-start">
          <section class="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-base font-bold text-foreground">Covers</h2>
              <button
                type="button"
                @click="addCover"
                class="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-soft"
              >
                Add
              </button>
            </div>

            <div class="mt-3 space-y-3">
              <p v-if="!covers.length" class="rounded-lg bg-surface px-3 py-3 text-sm text-foreground-muted">No covers yet.</p>
              <div v-for="(cover, index) in covers" :key="index" class="rounded-lg border border-border bg-surface p-3">
                <div class="flex items-center gap-2">
                  <input
                    v-model="cover.id"
                    @input="normalizeCoverVideoId(cover)"
                    class="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-foreground-subtle focus:border-primary focus:ring-4 focus:ring-primary-soft"
                    placeholder="Cover youtube video ID or link"
                  />
                  <button
                    type="button"
                    @click="removeCover(index)"
                    class="h-10 rounded-lg border border-danger px-3 text-xs font-semibold text-danger transition hover:bg-surface-hover"
                  >
                    Remove
                  </button>
                </div>

                <div class="mt-2">
                  <ArtistInputMenu v-model="cover.artists" :search="searchArtists" :disabled="isLoading" placeholder="Search cover artists" />
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 class="text-base font-bold text-foreground">Preview</h2>
            <dl class="mt-3 space-y-2 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">Video</dt>
                <dd class="truncate font-semibold text-foreground">{{ videoId || '-' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">Title</dt>
                <dd class="truncate font-semibold text-foreground">{{ title || '-' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">Alt</dt>
                <dd class="font-semibold text-foreground">{{ cleanAltTitles.length }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">Artists</dt>
                <dd class="font-semibold text-foreground">{{ artistIds.length }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">Covers</dt>
                <dd class="font-semibold text-foreground">{{ cleanCovers.length }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">Blocks</dt>
                <dd class="font-semibold text-foreground">{{ contents.filter((item) => item.kind && item.content).length }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">Unsaved</dt>
                <dd class="font-semibold text-foreground">{{ isDirty ? 'Yes' : 'No' }}</dd>
              </div>
            </dl>
            <p v-if="error" class="mt-3 rounded-lg border border-danger bg-surface px-3 py-2 text-sm font-medium text-danger">
              {{ error }}
            </p>
          </section>
        </aside>
      </form>
    </div>
  </div>
</template>
