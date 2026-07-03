import useAppFetch from '.';
import { useStorage } from '@vueuse/core';

const LYRICS_BANK_KEY = 'lyrics-bank';
export const LYRICS_LIST_KEY = 'lyrics-list';

export const getLyricsById = async (id: string, force = false) => {
  const bank = useStorage<{ [key: string]: Lyrics }>(LYRICS_BANK_KEY, {});

  if (bank.value[id] && !force) {
    return bank.value[id];
  }

  const encodedId = encodeURIComponent(id);
  const { data } = await useAppFetch(`lyrics/${encodedId}`).get().json();
  bank.value[id] = data.value.data;
  return bank.value[id];
};

export const getLyricsList = async (page: number, force = false, all = false) => {
  const list = useStorage<Record<number, Lyrics[]>>(LYRICS_LIST_KEY, {});

  if (all) {
    return Object.keys(list.value)
      .map((key) => Number(key))
      .sort((a, b) => a - b)
      .flatMap((key) => list.value[key] ?? []);
  }

  // force = clear all data and start fresh
  if (force) list.value = {};

  if (list.value[page]) return list.value[page];

  const { data } = await useAppFetch(`lyrics/list?page=${page}`).get().json();
  list.value[page] = Array.isArray(data.value?.data?.items) ? (data.value.data.items as Lyrics[]) : [];

  return list.value[page];
};
