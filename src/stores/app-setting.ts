import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAppSetting = defineStore('app-setting', () => {
  const isFirstLoadHomePage = ref(true);

  return { isFirstLoadHomePage };
});
