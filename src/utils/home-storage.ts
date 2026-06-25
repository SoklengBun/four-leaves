import { useStorage } from '@vueuse/core';
import type { HomeSong } from './lyrics';

export type HomePlaylistItem = {
  id: number;
  lyricsId?: number;
  note?: string;
  song?: HomeSong;
};

export type HomePlaylist = {
  id: number;
  name: string;
  description?: string;
  items?: HomePlaylistItem[];
};

export type HomeCacheData = {
  songs: Lyrics[];
  playlists: HomePlaylist[];
};

export type HomeCache = {
  date: string;
  data: HomeCacheData;
};

const HOME_STORAGE_KEY = 'home';
const LEGACY_LYRICS_LIST_STORAGE_KEY = 'lyrics-list';

const createEmptyHomeCacheData = (): HomeCacheData => ({
  songs: [],
  playlists: [],
});

const createEmptyHomeCache = (): HomeCache => ({
  date: '',
  data: createEmptyHomeCacheData(),
});

const removeLegacyLyricsListStorage = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LEGACY_LYRICS_LIST_STORAGE_KEY);
};

export const getTodayStorageDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const useHomeStorage = () => {
  removeLegacyLyricsListStorage();
  return useStorage<HomeCache>(HOME_STORAGE_KEY, createEmptyHomeCache());
};
