import { useStorage } from '@vueuse/core';

const HOME_STORAGE_KEY = 'home';

export const getTodayStorageDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

type HomeStorage = {
  date: string;
  songs: Lyrics[];
  playlists: Playlist[];
};

export const useHomeStorage = () => {
  return useStorage<HomeStorage>(HOME_STORAGE_KEY, {
    date: '',
    songs: [],
    playlists: [],
  });
};
