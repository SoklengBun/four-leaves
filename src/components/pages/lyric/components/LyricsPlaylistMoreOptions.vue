<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import CustomPopup from '~/components/shares/CustomPopup.vue';
import { usePlaylist } from '~/stores/playlist';

const props = defineProps<{
  playlist: Playlist;
}>();

const show = defineModel<boolean>('show', { required: true });

const router = useRouter();
const playlistStore = usePlaylist();

const isRemoving = ref(false);
const description = computed(() => props.playlist.description || 'Choose what you want to do with this playlist.');

const onClose = () => {
  show.value = false;
};

const onEditPlaylist = () => {
  playlistStore.openUpdatePopup(props.playlist);
  onClose();
};

const onRemovePlaylist = async () => {
  if (isRemoving.value) return;

  isRemoving.value = true;

  try {
    const removed = await playlistStore.remove(props.playlist.id);
    if (!removed) return;

    onClose();
    router.push({ name: 'lyrics' });
  } finally {
    isRemoving.value = false;
  }
};
</script>

<template>
  <CustomPopup
    v-model:show="show"
    desktop-position="right"
    mobile-position="right"
    eyebrow="Playlist actions"
    :title="playlist.name"
    :description="description"
    @close="onClose"
  >
    <div class="flex flex-1 flex-col gap-[10px] overflow-y-auto pb-4">
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-left text-[#9a6782] shadow-[0_12px_24px_#ebbcd229]"
        @click="onEditPlaylist"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
        >
          ✎
        </span>
        <span class="flex flex-col">
          <strong class="text-sm">Edit playlist</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">Update the playlist name, description, or visibility.</small>
        </span>
      </button>

      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-[20px] border border-[#ffd7e9f2] bg-[#ffffffdb] p-[14px] text-left text-[#9a6782] shadow-[0_12px_24px_#ebbcd229] disabled:cursor-wait disabled:opacity-80"
        :disabled="isRemoving"
        @click="onRemovePlaylist"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffe8f3_100%)] text-[18px] leading-none"
        >
          <span
            v-if="isRemoving"
            class="h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
            aria-hidden="true"
          />
          <span v-else>−</span>
        </span>
        <span class="flex flex-col">
          <strong class="text-sm">{{ isRemoving ? 'Removing playlist' : 'Remove playlist' }}</strong>
          <small class="mt-0.5 text-xs leading-[1.45] text-[#af849a]">
            {{ isRemoving ? 'Removing this playlist from your library...' : 'Delete this playlist and its song list from your library.' }}
          </small>
        </span>
      </button>
    </div>
  </CustomPopup>
</template>
