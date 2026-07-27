import { useStorage } from '@vueuse/core';

const HOME_STORAGE_KEY = 'home';

export const getTodayStorageDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export type HomeResponse = {
  songs: Lyrics[];
  playlists: RawPlaylist[];
  artists: LyricsArtist[];
};

export type HomeApiResponse = Partial<HomeResponse> & {
  code?: number;
  data?: HomeResponse | null;
};

export const normalizeHomeResponse = (response: HomeApiResponse | null): HomeResponse | null => {
  if (!response || (response.code !== undefined && response.code !== 0)) return null;
  if (response.code !== undefined && !response.data) return null;

  const payload = response.data ?? response;

  return {
    songs: payload.songs ?? [],
    playlists: payload.playlists ?? [],
    artists: payload.artists ?? [],
  };
};

export type HomeStorage = {
  date: string;
  songs: Lyrics[];
  playlists: Playlist[];
  artists: LyricsArtist[];
};

export const useHomeStorage = () => {
  return useStorage<HomeStorage>(HOME_STORAGE_KEY, {
    date: '',
    songs: [],
    playlists: [],
    artists: [],
  });
};
