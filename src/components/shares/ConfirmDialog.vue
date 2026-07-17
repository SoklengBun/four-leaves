<script setup lang="ts">
import CustomPopup from '~/components/shares/CustomPopup.vue';

withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
  }>(),
  {
    eyebrow: 'Please confirm',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    loading: false,
  },
);

const show = defineModel<boolean>('show', { required: true });

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();

const onCancel = () => {
  if (show.value) {
    show.value = false;
  }

  emit('cancel');
};

const onConfirm = () => {
  emit('confirm');
};
</script>

<template>
  <CustomPopup
    v-model:show="show"
    desktop-position="center"
    mobile-position="bottom"
    :eyebrow="eyebrow"
    :title="title"
    :description="description"
    :show-close="!loading"
    @close="emit('cancel')"
  >
    <div class="flex flex-col gap-3">
      <slot />

      <div class="grid grid-cols-2 gap-[10px]">
        <button
          type="button"
          class="rounded-[18px] bg-surface px-[14px] py-3 text-sm font-bold text-foreground-muted disabled:cursor-wait disabled:opacity-70"
          :disabled="loading"
          @click="onCancel"
        >
          {{ cancelText }}
        </button>

        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-br from-primary to-secondary px-[14px] py-3 text-sm font-bold text-primary-foreground shadow-primary disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
          @click="onConfirm"
        >
          <span
            v-if="loading"
            class="h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
            aria-hidden="true"
          />
          {{ loading ? 'Removing...' : confirmText }}
        </button>
      </div>
    </div>
  </CustomPopup>
</template>
