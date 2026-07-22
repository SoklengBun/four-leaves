import { computed } from 'vue';
import { useColorMode } from '@vueuse/core';

const THEME_STORAGE_KEY = 'vueuse-color-scheme';

export const useAppTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage.getItem(THEME_STORAGE_KEY) === 'auto') {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  }

  const mode = useColorMode({
    initialValue: 'dark',
    storageKey: THEME_STORAGE_KEY,
  });

  return computed({
    get: () => mode.value === 'dark',
    set: (value: boolean) => {
      mode.value = value ? 'dark' : 'light';
    },
  });
};
