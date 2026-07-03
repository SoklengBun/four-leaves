import useAppFetch from '.';

export const getUserPlaylists = async () => {
  return useAppFetch('playlist/mine').get().json();
};

export const createPlaylist = async (payload: CreatePlaylist) => {
  return useAppFetch('playlist/add').post(payload).json();
};

export const getPlaylistDetail = async (id: number | string) => {
  return useAppFetch(`playlist/${encodeURIComponent(id)}`)
    .get()
    .json();
};

export const updatePlaylist = (id: number, payload: UpdatePlaylist) => {
  return useAppFetch(`playlist/${encodeURIComponent(id)}`)
    .put(payload)
    .json();
};

export const removePlaylist = (id: number) => {
  return useAppFetch(`playlist/${encodeURIComponent(id)}`)
    .delete()
    .json();
};

export const addToPlaylist = async (id: number, payload: AddToPlaylist) => {
  return useAppFetch(`playlist/${encodeURIComponent(id)}/items`)
    .post(payload)
    .json();
};

export const removeFromPlaylist = async (id: number, itemId: number) => {
  return useAppFetch(`playlist/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}`)
    .delete()
    .json();
};

export const updatePlaylistItem = async (itemId: number, payload: UpdatePlaylistItem) => {
  return useAppFetch(`playlist/items/${encodeURIComponent(itemId)}`)
    .put(payload)
    .json();
};
