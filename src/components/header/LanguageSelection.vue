<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { supportLanguage } from "@/locales";
import { requireImage } from "~/utils/helper";
const i18n = useI18n();

const changeLanguage = (newLang: string) => {
  i18n.locale.value = newLang;
};
</script>

<template>
  <div class="group hover:cursor-pointer">
    <button class="flex group-hover:scale-125 duration-300">
      <img :src="requireImage('earth.svg')" class="w-7 h-7" />
    </button>
    <div class="hidden group-hover:flex absolute top-0 w-8">
      <div
        class="flex flex-col items-start shadow-md dark:shadow-white/20 py-1 mt-8 w-full bg-white dark:bg-dark"
      >
        <button
          v-for="item in i18n.availableLocales"
          :key="item"
          type="button"
          class="text-blue-400 hover:text-blue-500 hover:font-bold w-full hover:bg-white/20 flex items-start px-1"
          @click="changeLanguage(item)"
        >
          {{ supportLanguage[item].label }}
        </button>
      </div>
    </div>
  </div>
</template>
