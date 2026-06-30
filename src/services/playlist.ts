import useAppFetch from '.';

export type CreatePlaylistPayload = {
  name: string;
  description: string;
  isPublic: boolean;
  lyricsIds: number[];
};

export type AddPlaylistItemsPayload = {
  lyricsIds: number[];
};

export const createPlaylist = async (payload: CreatePlaylistPayload) => {
  return useAppFetch('playlist/add').post(payload).json();
};

export const getMyPlaylists = async () => {
  return useAppFetch('playlist/mine').get().json();
};

export const addItemsToPlaylist = async (playlistId: number, payload: AddPlaylistItemsPayload) => {
  return useAppFetch(`playlist/${encodeURIComponent(String(playlistId))}/items`)
    .post(payload)
    .json();
};

export const removePlaylistItem = async (playlistId: number, itemId: number) => {
  return useAppFetch(`playlist/${encodeURIComponent(String(playlistId))}/items/${encodeURIComponent(String(itemId))}`)
    .delete()
    .json();
};

export const updatePlaylistItem = async (itemId: number, payload: { defaultCoverId: string }) => {
  return useAppFetch(`playlist/items/${encodeURIComponent(String(itemId))}`)
    .put(payload)
    .json();
};
