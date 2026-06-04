<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useAppFetch from '~/services';
import showToast from '~/utils/toast';
import ArtistSearch from '../../artist/ArtistSearch.vue';

type Artist = { id: number; name: string };

const titles = ref<string[]>(['']);
const artistIds = ref<number[]>([]);
const contents = ref<Array<{ kind: string; lang?: string; content: string }>>([{ kind: '', lang: '', content: '' }]);
const references = ref<Array<{ link?: string; name?: string }>>([]);
const summary = ref<string>('');

const artists = ref<Artist[]>([]);
const isSubmitting = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

// Add-artist UI state
const showAddArtist = ref(false);
const newArtistName = ref('');
const addArtistError = ref<string | null>(null);
const addArtistSubmitting = ref(false);

const addTitle = () => titles.value.push('');
const removeTitle = (i: number) => titles.value.splice(i, 1);

const allKinds = ['romaji', 'japanese', 'english', 'translation'];

const addContent = () => {
  // find first unused kind
  const used = new Set(contents.value.map((c) => c.kind).filter(Boolean));
  const unused = allKinds.find((k) => !used.has(k));
  if (!unused) {
    showToast({ message: 'All content kinds have been added', type: 'error' });
    return;
  }
  contents.value.push({ kind: unused, lang: '', content: '' });
};

const setContentLang = (idx: number) => {
  const kind = contents.value[idx]?.kind || '';
  const map: Record<string, string> = {
    romaji: 'romaji',
    japanese: 'ja',
    english: 'en',
    translation: '',
  };
  contents.value[idx].lang = map[kind] ?? '';
};

const availableKindsFor = (idx: number) => {
  const used = new Set(contents.value.map((c, i) => (i === idx ? null : c.kind)).filter(Boolean));
  return allKinds.filter((k) => !used.has(k) || contents.value[idx]?.kind === k);
};
const removeContent = (i: number) => contents.value.splice(i, 1);

const addReference = () => references.value.push({ link: '', name: '' });
const removeReference = (i: number) => references.value.splice(i, 1);

const fetchArtists = async () => {
  try {
    const { data } = await useAppFetch('artist/list').get().json();
    if (data && data.value && Array.isArray(data.value.data)) {
      artists.value = data.value.data;
    }
  } catch (e) {
    // ignore — artist list optional
  }
};

const route = useRoute();
const router = useRouter();

const editingId = ref<number | null>(null);

const fetchLyricForEdit = async (id: number) => {
  try {
    const { data } = await useAppFetch(`lyrics/${id}`).get().json();
    if (data.value && data.value.code === 0) {
      const item = data.value.data;
      // prefill fields based on payload shape
      titles.value = (item.titles || []).map((t: any) => t.title || '');
      artistIds.value = (item.artists || []).map((a: any) => a.id);
      contents.value = (item.contents || []).map((c: any) => ({ kind: c.kind || '', lang: c.lang || '', content: c.content || '' }));
      references.value = (item.references || []).map((r: any) => ({ link: r.link || '', name: r.name || '' }));
      summary.value = item.summary || '';
    } else {
      showToast({ message: data.value?.message || 'Failed to load lyric', type: 'error' });
    }
  } catch (e) {
    showToast({ message: 'Network error while loading lyric', type: 'error' });
  }
};

onMounted(async () => {
  await fetchArtists();
  const idParam = route.params.id as string | undefined;
  if (idParam) {
    const idNum = parseInt(idParam, 10);
    if (!Number.isNaN(idNum)) {
      editingId.value = idNum;
      await fetchLyricForEdit(idNum);
    }
  }
});

const addArtist = async () => {
  const name = (newArtistName.value || '').trim();
  addArtistError.value = null;
  if (!name) {
    showToast({ message: 'Name is required', type: 'error' });
    addArtistError.value = 'Name is required';
    return;
  }

  // client-side duplicate check
  const dup = artists.value.find((a) => a.name.toLowerCase() === name.toLowerCase());
  if (dup) {
    showToast({ message: 'An artist with this name already exists', type: 'error' });
    addArtistError.value = 'An artist with this name already exists';
    return;
  }

  addArtistSubmitting.value = true;
  try {
    const { data } = await useAppFetch('artist/add').post({ name }).json();
    if (data.value && data.value.code === 0) {
      const artist: Artist = data.value.data;
      // append to local cache and select
      artists.value.push(artist);
      artistIds.value.push(artist.id);
      showToast({ message: 'Artist added', type: 'success' });
      newArtistName.value = '';
      showAddArtist.value = false;
      addArtistError.value = null;
    } else {
      const msg = data.value?.message || 'Failed to add artist';
      showToast({ message: msg, type: 'error' });
      addArtistError.value = msg;
    }
  } catch (e) {
    showToast({ message: 'Network error while adding artist', type: 'error' });
    addArtistError.value = 'Network error while adding artist';
  } finally {
    addArtistSubmitting.value = false;
  }
};

const validate = () => {
  if (!titles.value.some((t) => t && t.trim().length > 0)) {
    showToast({ message: 'At least one title is required', type: 'error' });
    error.value = 'At least one title is required';
    return false;
  }

  for (const c of contents.value) {
    if (!c.kind || !c.content || !c.content.trim()) {
      showToast({ message: 'Each content entry requires a kind and content', type: 'error' });
      error.value = 'Each content entry requires a kind and content';
      return false;
    }
  }

  // ensure kinds are unique
  const kinds = contents.value.map((c) => c.kind).filter(Boolean);
  if (new Set(kinds).size !== kinds.length) {
    showToast({ message: 'Duplicate content kinds are not allowed', type: 'error' });
    error.value = 'Duplicate content kinds are not allowed';
    return false;
  }

  error.value = null;
  return true;
};

const onSubmit = async () => {
  if (!validate()) return;

  const payload = {
    titles: titles.value.filter((t) => t && t.trim()),
    artistIds: artistIds.value,
    contents: contents.value.map((c) => ({ kind: c.kind, lang: c.lang || undefined, content: c.content })),
    references: references.value.filter((r) => (r.link && r.link.trim()) || (r.name && r.name.trim())),
    summary: summary.value || undefined,
  };

  isSubmitting.value = true;
  success.value = false;
  try {
    let data: any = null;
    if (editingId.value) {
      const resp = await useAppFetch(`lyrics/${editingId.value}`).put(payload).json();
      data = resp.data;
    } else {
      const resp = await useAppFetch('lyrics/add').post(payload).json();
      data = resp.data;
    }

    if (data.value && data.value.code === 0) {
      success.value = true;
      // navigate back to my lyrics after save
      router.push({ name: 'lyrics-mine' }).catch(() => {});
    } else {
      const msg = data.value?.message || 'Save failed';
      showToast({ message: msg, type: 'error' });
      error.value = msg;
    }
  } catch (e) {
    showToast({ message: 'Network error while saving', type: 'error' });
    error.value = 'Network error while saving';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="flex h-[calc(var(--body-height))] flex-col items-center pt-nav">
    <div class="container mt-1 flex w-full flex-1 flex-col space-y-2 overflow-y-auto pb-5 pt-1">
      <div class="mx-auto w-full space-y-2 md:space-y-6">
        <header>
          <h1 class="text-2xl font-semibold">{{ editingId ? 'Edit Lyrics' : 'Add Lyrics' }}</h1>
          <p class="text-muted-foreground text-sm">
            {{ editingId ? 'Edit the lyric entry below.' : 'Provide titles, artists, and one or more content blocks.' }}
          </p>
        </header>

        <form @submit.prevent="onSubmit" class="w-full space-y-2 md:space-y-6">
          <section class="rounded bg-white p-3 shadow-sm dark:bg-slate-800 sm:p-4">
            <label class="block text-sm font-medium">Titles (at least one)</label>
            <div class="mt-3 space-y-2">
              <div v-for="(t, i) in titles" :key="i" class="flex gap-2">
                <input v-model="titles[i]" placeholder="Title" class="flex-1 rounded border px-3 py-2" />
                <button
                  type="button"
                  @click="removeTitle(i)"
                  class="inline-flex items-center rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
              <button type="button" @click="addTitle" class="inline-flex items-center rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700">
                Add title
              </button>
            </div>
          </section>

          <section class="rounded bg-white p-3 shadow-sm dark:bg-slate-800 sm:p-4">
            <label class="block text-sm font-medium">Artists</label>

            <div class="mt-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                @click="showAddArtist = !showAddArtist"
                class="inline-flex items-center rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
              >
                {{ showAddArtist ? 'Close' : 'Add artist' }}
              </button>
              <span class="text-muted-foreground text-sm">or select from the list</span>
            </div>

            <div v-if="showAddArtist" class="mt-3 rounded border bg-gray-50 p-3 dark:bg-slate-900">
              <input v-model="newArtistName" placeholder="Artist name" class="w-full rounded border px-3 py-2" />
              <div class="mt-2 flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  @click="addArtist"
                  :disabled="addArtistSubmitting"
                  class="inline-flex w-full items-center justify-center rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 sm:w-auto"
                >
                  Save
                </button>
                <button
                  type="button"
                  @click="
                    () => {
                      showAddArtist = false;
                      newArtistName = '';
                      addArtistError = null;
                    }
                  "
                  class="inline-flex w-full items-center justify-center rounded bg-gray-300 px-3 py-2 hover:bg-gray-400 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div class="mt-3">
              <ArtistSearch v-model="artistIds" :known-artists="artists" placeholder="Search and select artists" :release-delay-ms="1500" />
            </div>
          </section>

          <section class="rounded bg-white p-3 shadow-sm dark:bg-slate-800 sm:p-4">
            <label class="block text-sm font-medium">Contents</label>
            <div class="mt-3 space-y-3">
              <div v-for="(c, idx) in contents" :key="idx" class="rounded border bg-gray-50 p-3 dark:bg-slate-900">
                <div class="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <select v-model="c.kind" @change="setContentLang(idx)" class="w-full rounded border px-2 py-1 sm:w-48">
                    <option disabled value="">Select kind</option>
                    <option v-for="k in availableKindsFor(idx)" :key="k" :value="k">{{ k }}</option>
                  </select>
                  <!-- language is auto-selected based on kind; no UI shown -->
                  <button
                    type="button"
                    @click="removeContent(idx)"
                    class="mt-2 inline-flex items-center rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 sm:mt-0"
                  >
                    Remove
                  </button>
                </div>
                <textarea v-model="c.content" rows="6" class="mt-3 w-full rounded border px-3 py-2" placeholder="Lyrics or translation"></textarea>
              </div>
              <button
                type="button"
                @click="addContent"
                class="inline-flex items-center rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
              >
                Add content
              </button>
            </div>
          </section>

          <section class="rounded bg-white p-3 shadow-sm dark:bg-slate-800 sm:p-4">
            <label class="block text-sm font-medium">References</label>
            <div class="mt-3 space-y-2">
              <div v-for="(r, i) in references" :key="i" class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input v-model="r.link" placeholder="Link (optional)" class="flex-1 rounded border px-3 py-2" />
                <input v-model="r.name" placeholder="Name (optional)" class="w-full rounded border px-3 py-2 sm:w-48" />
                <button
                  type="button"
                  @click="removeReference(i)"
                  class="mt-2 inline-flex items-center rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 sm:mt-0"
                >
                  Remove
                </button>
              </div>
              <button
                type="button"
                @click="addReference"
                class="inline-flex w-full items-center justify-center rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700 sm:w-auto"
              >
                Add reference
              </button>
            </div>
          </section>

          <section class="rounded bg-white p-3 shadow-sm dark:bg-slate-800 sm:p-4">
            <label class="block text-sm font-medium">Summary</label>
            <input v-model="summary" placeholder="Short summary" class="mt-2 w-full rounded border px-3 py-2" />
          </section>

          <div class="flex items-center gap-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex w-full items-center justify-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 sm:w-auto"
            >
              {{ editingId ? 'Save' : 'Submit' }}
            </button>
            <span v-if="success" class="text-green-600">Saved successfully</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
