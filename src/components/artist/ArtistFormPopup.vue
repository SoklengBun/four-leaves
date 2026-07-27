<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import ArtistInputMenu from '~/components/pages/lyric/components/ArtistInputMenu.vue';
import CustomPopup from '~/components/shares/CustomPopup.vue';
import useAppFetch from '~/services';
import { createArtist, updateArtist, type ArtistPayload } from '~/services/artist';
import showToast from '~/utils/toast';

type ArtistOption = {
  id: number;
  name: string;
  altName?: string;
  cv?: ArtistOption | null;
};

export type ArtistSavedPayload = ArtistPayload & {
  id?: number;
  cv?: LyricsArtist | null;
};

const props = withDefaults(
  defineProps<{
    artist?: LyricsArtist | null;
    mode?: 'create' | 'edit';
  }>(),
  {
    artist: null,
    mode: 'create',
  },
);

const show = defineModel<boolean>('show', { required: true });
const emit = defineEmits<{
  saved: [artist: ArtistSavedPayload];
}>();

const form = reactive({
  name: '',
  altName: '',
});
const selectedCv = ref<ArtistOption[]>([]);
const cvSelection = computed({
  get: () => selectedCv.value,
  set: (value: ArtistOption[]) => {
    selectedCv.value = value.slice(-1);
  },
});
const isSubmitting = ref(false);
const error = ref('');

const isEditMode = computed(() => props.mode === 'edit');
const title = computed(() => (isEditMode.value ? 'Edit artist' : 'Add artist'));
const description = computed(() =>
  isEditMode.value ? 'Update the artist details used across the lyrics catalog.' : 'Add an artist to the existing artist catalog.',
);
const canSubmit = computed(() => form.name.trim().length > 0 && !isSubmitting.value);

const resetForm = () => {
  form.name = isEditMode.value ? props.artist?.name ?? '' : '';
  form.altName = isEditMode.value ? props.artist?.altName ?? '' : '';

  if (isEditMode.value && props.artist?.cv) {
    selectedCv.value = [props.artist.cv];
  } else if (isEditMode.value && props.artist?.cvId) {
    selectedCv.value = [{ id: props.artist.cvId, name: `Artist #${props.artist.cvId}` }];
  } else {
    selectedCv.value = [];
  }

  error.value = '';
};

const searchArtists = async (keyword: string) => {
  const query = keyword.trim();
  if (query.length < 2) return [];

  const { data } = await useAppFetch(`artist/search?q=${encodeURIComponent(query)}`).get().json();

  if (data.value?.code !== undefined && data.value.code !== 0) {
    throw new Error(data.value?.message || 'Artist search failed');
  }

  return (Array.isArray(data.value?.data) ? data.value.data : []) as ArtistOption[];
};

const onClose = () => {
  if (!isSubmitting.value) show.value = false;
};

const onSubmit = async () => {
  if (!canSubmit.value) return;

  const payload: ArtistPayload = {
    name: form.name.trim(),
    altName: form.altName.trim() || undefined,
    cvId: selectedCv.value[0]?.id,
  };

  isSubmitting.value = true;
  error.value = '';

  try {
    const response = isEditMode.value
      ? await updateArtist(props.artist?.id ?? 0, payload)
      : await createArtist(payload);
    const responseData = response.data.value?.data;
    const savedArtist = (responseData?.artist ?? responseData) as Partial<ArtistSavedPayload> | null;

    if (response.data.value?.code !== 0) {
      throw new Error(response.data.value?.message || 'Unable to save artist');
    }

    emit('saved', {
      ...payload,
      id: Number(savedArtist?.id ?? props.artist?.id) || undefined,
      cv: (selectedCv.value[0] as LyricsArtist | undefined) ?? null,
    });
    showToast({ message: isEditMode.value ? 'Artist updated' : 'Artist added', type: 'success' });
    show.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to save artist';
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  [show, () => props.artist, () => props.mode],
  ([isVisible]) => {
    if (isVisible) resetForm();
  },
  { immediate: true },
);
</script>

<template>
  <CustomPopup
    v-model:show="show"
    desktop-position="center"
    mobile-position="bottom"
    :eyebrow="isEditMode ? 'Artist details' : 'New artist'"
    :title="title"
    :description="description"
    @close="onClose"
  >
    <div class="flex flex-col gap-[14px]">
      <label class="flex flex-col gap-[7px]">
        <span class="text-xs font-bold text-foreground-muted">Name</span>
        <input
          v-model="form.name"
          type="text"
          maxlength="120"
          placeholder="Hatsune Miku"
          :disabled="isSubmitting"
          class="w-full rounded-[18px] border border-border bg-surface px-[14px] py-3 text-sm text-foreground shadow-inner outline-none focus:border-primary disabled:cursor-wait disabled:opacity-70"
        />
      </label>

      <label class="flex flex-col gap-[7px]">
        <span class="text-xs font-bold text-foreground-muted">Alternate name <span class="font-normal">(optional)</span></span>
        <input
          v-model="form.altName"
          type="text"
          maxlength="120"
          placeholder="Hatsune Miku"
          :disabled="isSubmitting"
          class="w-full rounded-[18px] border border-border bg-surface px-[14px] py-3 text-sm text-foreground shadow-inner outline-none focus:border-primary disabled:cursor-wait disabled:opacity-70"
        />
      </label>

      <label class="flex flex-col gap-[7px]">
        <span class="text-xs font-bold text-foreground-muted">CV artist <span class="font-normal">(optional)</span></span>
        <ArtistInputMenu
          v-model="cvSelection"
          :search="searchArtists"
          :disabled="isSubmitting"
          placeholder="Search an existing artist"
        />
        <span class="text-xs leading-5 text-foreground-subtle">Choose an existing artist to link as the voice actor or CV.</span>
      </label>

      <p v-if="error" class="rounded-[16px] bg-danger/10 px-3 py-2 text-sm text-danger">{{ error }}</p>

      <div class="mt-1 grid grid-cols-2 gap-[10px]">
        <button
          type="button"
          class="rounded-[18px] bg-surface px-[14px] py-3 text-sm font-bold text-foreground-muted disabled:cursor-wait disabled:opacity-70"
          :disabled="isSubmitting"
          @click="onClose"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-br from-primary to-secondary px-[14px] py-3 text-sm font-bold text-primary-foreground shadow-primary disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!canSubmit"
          @click="onSubmit"
        >
          <span v-if="isSubmitting" class="h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" aria-hidden="true" />
          {{ isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Add artist' }}
        </button>
      </div>
    </div>
  </CustomPopup>
</template>
