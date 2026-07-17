<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';
import CustomPopup from '~/components/shares/CustomPopup.vue';
import { usePlaylist } from '~/stores/playlist';

const playlist = usePlaylist();
const { showFormPopup, formLyricsIds, formMode, formPlaylist } = storeToRefs(playlist);

const form = reactive({
  name: '',
  description: '',
  isPublic: false,
});

const isUpdateMode = computed(() => formMode.value === 'update');
const title = computed(() => (isUpdateMode.value ? 'Update playlist' : 'Create playlist'));
const subtitle = computed(() =>
  isUpdateMode.value ? 'Adjust the playlist details and save your changes.' : 'Give your playlist a name and save it to your library.',
);
const songCount = computed(() => (isUpdateMode.value ? (formPlaylist.value?.items.length ?? 0) : formLyricsIds.value.length));
const isSubmitting = ref(false);
const canSubmit = computed(() => form.name.trim().length > 0 && !isSubmitting.value);

watch(
  [showFormPopup, formMode, formPlaylist],
  ([show]) => {
    if (!show) return;

    form.name = formPlaylist.value?.name ?? '';
    form.description = formPlaylist.value?.description ?? '';
    form.isPublic = formPlaylist.value?.isPublic ?? false;

    if (!isUpdateMode.value) {
      form.name = '';
      form.description = '';
      form.isPublic = false;
    }
  },
  { immediate: true },
);

const onClose = () => {
  if (isSubmitting.value) return;
  playlist.closeFormPopup();
};

const onSubmit = async () => {
  if (!form.name.trim().length || isSubmitting.value) return;

  const payload: CreatePlaylist = {
    name: form.name.trim(),
    description: form.description.trim(),
    isPublic: form.isPublic,
    lyricsIds: isUpdateMode.value ? (formPlaylist.value?.items.map((item) => item.id) ?? []) : formLyricsIds.value,
  };

  isSubmitting.value = true;

  try {
    if (isUpdateMode.value) {
      await playlist.update(payload);
      return;
    }

    await playlist.create(payload);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <CustomPopup
    v-model:show="showFormPopup"
    desktop-position="center"
    mobile-position="bottom"
    :eyebrow="isUpdateMode ? 'Edit details' : 'New playlist'"
    :title="title"
    :description="subtitle"
    @close="onClose"
  >
    <div class="flex flex-col gap-[14px]">
      <label class="flex flex-col gap-[7px]">
        <span class="text-xs font-bold text-foreground-muted">Playlist name</span>
        <input
          v-model="form.name"
          type="text"
          maxlength="100"
          placeholder="Soft Cloud Mix"
          :disabled="isSubmitting"
          class="w-full rounded-[18px] border border-border bg-surface px-[14px] py-3 text-sm text-foreground shadow-inner outline-none focus:border-primary disabled:cursor-wait disabled:opacity-70"
        />
      </label>

      <label class="flex flex-col gap-[7px]">
        <span class="text-xs font-bold text-foreground-muted">Description</span>
        <textarea
          v-model="form.description"
          rows="4"
          maxlength="300"
          placeholder="A calm set of songs for late-night listening."
          :disabled="isSubmitting"
          class="min-h-[108px] w-full resize-y rounded-[18px] border border-border bg-surface px-[14px] py-3 text-sm text-foreground shadow-inner outline-none focus:border-primary disabled:cursor-wait disabled:opacity-70"
        />
      </label>

      <label class="flex items-center justify-between gap-4 rounded-[22px] border border-border bg-card p-[14px]">
        <span>
          <strong class="block text-sm text-foreground">Public playlist</strong>
          <small class="mt-[3px] block text-xs leading-[1.45] text-foreground-muted">Let other people discover this playlist.</small>
        </span>
        <input v-model="form.isPublic" :disabled="isSubmitting" type="checkbox" class="h-5 w-5 accent-primary disabled:cursor-wait" />
      </label>

      <div class="flex flex-wrap justify-between gap-2 rounded-[18px] bg-primary-soft px-[14px] py-3 text-xs text-foreground-muted">
        <span>{{ songCount }} song{{ songCount === 1 ? '' : 's' }}</span>
        <span>{{ isUpdateMode ? 'Existing songs will stay in this playlist.' : 'Selected songs will be added after creation.' }}</span>
      </div>

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
          <span
            v-if="isSubmitting"
            class="h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
            aria-hidden="true"
          />
          {{ isSubmitting ? (isUpdateMode ? 'Saving...' : 'Creating...') : isUpdateMode ? 'Save changes' : 'Create playlist' }}
        </button>
      </div>
    </div>
  </CustomPopup>
</template>
