<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, reactive, watch } from 'vue';
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
const canSubmit = computed(() => form.name.trim().length > 0);

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
  playlist.closeFormPopup();
};

const onSubmit = async () => {
  if (!canSubmit.value) return;

  const payload: CreatePlaylist = {
    name: form.name.trim(),
    description: form.description.trim(),
    isPublic: form.isPublic,
    lyricsIds: isUpdateMode.value ? (formPlaylist.value?.items.map((item) => item.id) ?? []) : formLyricsIds.value,
  };

  if (isUpdateMode.value) {
    await playlist.update(payload);
    return;
  }

  await playlist.create(payload);
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
        <span class="text-xs font-bold text-[#8f647d]">Playlist name</span>
        <input
          v-model="form.name"
          type="text"
          maxlength="100"
          placeholder="Soft Cloud Mix"
          class="w-full rounded-[18px] border border-[#ffdbe9] bg-[#ffffffd9] px-[14px] py-3 text-sm text-[#6d4c60] shadow-[inset_0_1px_0_#ffffffcc] outline-none focus:border-[#ff9bc5]"
        />
      </label>

      <label class="flex flex-col gap-[7px]">
        <span class="text-xs font-bold text-[#8f647d]">Description</span>
        <textarea
          v-model="form.description"
          rows="4"
          maxlength="300"
          placeholder="A calm set of songs for late-night listening."
          class="min-h-[108px] w-full resize-y rounded-[18px] border border-[#ffdbe9] bg-[#ffffffd9] px-[14px] py-3 text-sm text-[#6d4c60] shadow-[inset_0_1px_0_#ffffffcc] outline-none focus:border-[#ff9bc5]"
        />
      </label>

      <label class="flex items-center justify-between gap-4 rounded-[22px] border border-[#ffe0ec] bg-[#ffffffb8] p-[14px]">
        <span>
          <strong class="block text-sm text-[#7e546e]">Public playlist</strong>
          <small class="mt-[3px] block text-xs leading-[1.45] text-[#aa859b]">Let other people discover this playlist.</small>
        </span>
        <input v-model="form.isPublic" type="checkbox" class="h-5 w-5 accent-[#e873aa]" />
      </label>

      <div class="flex flex-wrap justify-between gap-2 rounded-[18px] bg-[#fff7fbcc] px-[14px] py-3 text-xs text-[#ab7f96]">
        <span>{{ songCount }} song{{ songCount === 1 ? '' : 's' }}</span>
        <span>{{ isUpdateMode ? 'Existing songs will stay in this playlist.' : 'Selected songs will be added after creation.' }}</span>
      </div>

      <div class="mt-1 grid grid-cols-2 gap-[10px]">
        <button type="button" class="rounded-[18px] bg-[#ffffffc9] px-[14px] py-3 text-sm font-bold text-[#94677f]" @click="onClose">Cancel</button>
        <button
          type="button"
          class="rounded-[18px] bg-[linear-gradient(135deg,_#ff94be_0%,_#ff6ca7_100%)] px-[14px] py-3 text-sm font-bold text-white shadow-[0_12px_24px_#ff7caf38] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!canSubmit"
          @click="onSubmit"
        >
          {{ isUpdateMode ? 'Save changes' : 'Create playlist' }}
        </button>
      </div>
    </div>
  </CustomPopup>
</template>
