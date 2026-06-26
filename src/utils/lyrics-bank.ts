import { useStorage } from '@vueuse/core';

const LYRICS_BANK_KEY = 'lyrics-bank';

type LyricsBankStorage = {
  [key: string]: Lyrics;
};

export const useLyricsBank = () => {
  return useStorage<LyricsBankStorage>(LYRICS_BANK_KEY, {});
};
