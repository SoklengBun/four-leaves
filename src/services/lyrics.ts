import { useLyricsBank } from '~/utils/lyrics-bank';
import useAppFetch from '.';

export const getLyricsById = async (id: string) => {
  const bank = useLyricsBank();

  if (bank.value[id]) {
    return bank.value[id];
  }

  const encodedId = encodeURIComponent(id);
  const { data } = await useAppFetch(`lyrics/${encodedId}`).get().json();
  bank.value[id] = data.value.data;
  return bank.value[id];
};
