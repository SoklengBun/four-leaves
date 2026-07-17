import { useDark } from '@vueuse/core';

const THEME_STORAGE_KEY = 'vueuse-color-scheme';

export const useAppTheme = () => {
  const shouldUseDarkDefault = typeof window !== 'undefined' && window.localStorage.getItem(THEME_STORAGE_KEY) === 'auto';
  const isDark = useDark({
    initialValue: 'dark',
    storageKey: THEME_STORAGE_KEY,
  });

  if (shouldUseDarkDefault) {
    isDark.value = true;
  }

  return isDark;
};
