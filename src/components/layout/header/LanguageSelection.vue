<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { supportLanguage } from '@/locales';
import { requireImage } from '~/utils/helper';
const i18n = useI18n();

const changeLanguage = (newLang: string) => {
  i18n.locale.value = newLang;
};
</script>

<template>
  <div class="group hover:cursor-pointer">
    <button class="flex duration-300 group-hover:scale-125">
      <img :src="requireImage('earth.svg')" class="h-7 w-7" />
    </button>
    <div class="absolute top-0 hidden w-8 group-hover:flex">
      <div
        class="mt-8 flex w-full flex-col items-start rounded-md border border-border bg-surface py-1 shadow-lg"
      >
        <button
          v-for="item in i18n.availableLocales"
          :key="item"
          type="button"
          class="flex w-full items-start px-1 text-foreground-muted hover:bg-surface-hover hover:font-bold hover:text-primary"
          @click="changeLanguage(item)"
        >
          {{ supportLanguage[item].label }}
        </button>
      </div>
    </div>
  </div>
</template>
