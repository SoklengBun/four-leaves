import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAppSetting = defineStore('app-setting', () => {
  const isFirstLoadHomePage = ref(true);
  const scrollPosition = ref<{ [key: string]: number }>({});
  const setScrollPosition = (key: string, value: number) => {
    scrollPosition.value[key] = value;
  };
  const getScrollPosition = (key: string) => {
    return scrollPosition.value[key];
  };

  return { isFirstLoadHomePage, setScrollPosition, getScrollPosition };
});
