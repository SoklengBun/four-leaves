import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
  addToPlaylist,
  createPlaylist,
  getPlaylistDetail,
  getUserPlaylists,
  removeFromPlaylist,
  removePlaylist,
  updatePlaylist,
  updatePlaylistItem,
} from '~/services/playlist';
import { useAuth } from '~/stores/auth';
import { normalizePlaylistItems } from '~/utils/lyrics';
import { useStorage } from '@vueuse/core';
import showToast from '~/utils/toast';

export const usePlaylist = defineStore('playlist', () => {
  const auth = useAuth();

  const list = ref<Playlist>();
  const lists = useStorage<Playlist[]>('user-playlist', []);
  const isLoading = ref(false);
  const showFormPopup = ref(false);
  const formMode = ref<'create' | 'update'>('create');
  const formPlaylist = ref<Playlist | null>(null);
  const formLyricsIds = ref<number[]>([]);

  const closeFormPopup = () => {
    showFormPopup.value = false;
    formLyricsIds.value = [];
    if (formMode.value === 'create') {
      formPlaylist.value = null;
    }
  };

  const openCreatePopup = (lyricsIds: number[] = []) => {
    formMode.value = 'create';
    formPlaylist.value = null;
    formLyricsIds.value = [...lyricsIds];
    showFormPopup.value = true;
  };

  const openUpdatePopup = (playlist: Playlist) => {
    formMode.value = 'update';
    formPlaylist.value = playlist;
    formLyricsIds.value = playlist.items.map((item) => item.id);
    list.value = playlist;
    showFormPopup.value = true;
  };

  const getPlaylists = async (force = false) => {
    if (!auth.isLoggedIn) {
      lists.value = [];
      list.value = undefined;
      return;
    }

    if (!force && lists.value.length) return;

    isLoading.value = true;
    try {
      const { data } = await getUserPlaylists();

      if (data.value?.code !== 0) return;

      const playlists: Playlist[] = Array.isArray(data.value?.data) ? data.value.data.map((item: RawPlaylist) => normalizePlaylistItems(item)) : [];
      lists.value = playlists;

      if (list.value?.id) {
        list.value = playlists.find((item) => item.id === list.value?.id);
      }

      return playlists;
    } finally {
      isLoading.value = false;
    }
  };

  const getPlaylist = async (playlistId: number | string, force = false) => {
    if (!playlistId) return;

    const normalizedId = Number(playlistId);
    const cachedPlaylist = lists.value.find((item) => item.id === normalizedId);

    if (!force && cachedPlaylist) {
      list.value = cachedPlaylist;
      return cachedPlaylist;
    }

    isLoading.value = true;
    try {
      const { data } = await getPlaylistDetail(playlistId);

      if (data.value?.code !== 0) {
        showToast({ message: data.value?.message || 'Failed to fetch playlist', type: 'error' });
        return;
      }

      const playlist = normalizePlaylistItems(data.value.data as RawPlaylist);
      list.value = playlist;

      const index = lists.value.findIndex((item) => item.id === playlist.id);
      if (index >= 0) {
        lists.value[index] = playlist;
      }

      return playlist;
    } finally {
      isLoading.value = false;
    }
  };

  const create = async (payload: CreatePlaylist) => {
    if (!auth.isLoggedIn) return;

    try {
      const { data } = await createPlaylist(payload);

      if (data.value?.code !== 0) {
        showToast({ message: data.value?.message || 'Failed to create playlist', type: 'error' });
        return;
      }

      const playlist = normalizePlaylistItems(data.value.data as RawPlaylist);

      await getPlaylists(true);
      closeFormPopup();

      showToast({ message: `Created ${playlist.name}`, type: 'success' });
      return playlist;
    } finally {
    }
  };

  const update = async (payload: UpdatePlaylist) => {
    if (!auth.isLoggedIn) return;
    const selectedPlaylist = formPlaylist.value ?? list.value;
    if (!selectedPlaylist?.id) return;

    try {
      const { data } = await updatePlaylist(selectedPlaylist.id, payload);

      if (data.value?.code !== 0) {
        showToast({ message: data.value?.message || 'Failed to update playlist', type: 'error' });
        return;
      }

      const playlist = normalizePlaylistItems(data.value.data as RawPlaylist);
      lists.value = lists.value.map((item) => (item.id === playlist.id ? playlist : item));
      list.value = playlist;
      formPlaylist.value = playlist;
      closeFormPopup();

      showToast({ message: `Updated ${playlist.name}`, type: 'success' });
      return playlist;
    } finally {
    }
  };

  const remove = async (playlistId: number) => {
    if (!auth.isLoggedIn) return;
    try {
      const { data } = await removePlaylist(playlistId);
      if (data.value?.code !== 0) {
        showToast({ message: data.value?.message || 'Failed to delete playlist', type: 'error' });
        return false;
      }
      const item = lists.value.find((e) => e.id === playlistId);

      lists.value = lists.value.filter((e) => e.id !== playlistId);
      if (list.value?.id === playlistId) {
        list.value = undefined;
      }

      showToast({ message: `Delete ${item?.name}`, type: 'success' });
      return true;
    } finally {
    }
  };

  const addItems = async (playlistId: number, songIds: number[]) => {
    if (!auth.isLoggedIn) return;
    if (!playlistId) return;

    try {
      const { data } = await addToPlaylist(playlistId, { lyricsIds: songIds });
      if (data.value?.code !== 0) {
        showToast({ message: data.value?.message || 'Failed to add song to playlist', type: 'error' });
        return;
      }

      const idx = lists.value.findIndex((e) => e.id === playlistId);
      if (idx) lists.value[idx] = normalizePlaylistItems(data.value.data);

      showToast({ message: `Added Successfully`, type: 'success' });
    } finally {
    }
  };

  const removeItem = async (itemId: number) => {
    console.log('=>>>list', list.value);
    if (!auth.isLoggedIn) return;
    if (!list.value?.id) return;

    try {
      const { data } = await removeFromPlaylist(list.value.id, itemId);
      if (data.value?.code !== 0) {
        showToast({ message: data.value?.message || 'Failed to add song to playlist', type: 'error' });
        return;
      }

      list.value.items = list.value.items.filter((e) => e.playlistItemId !== itemId);

      showToast({ message: `Added ${list.value.name}`, type: 'success' });
    } finally {
    }
  };

  const updateItem = async (itemId: number, payload: UpdatePlaylistItem) => {
    if (!auth.isLoggedIn) return;
    if (!list.value?.id) return;

    try {
      const { data } = await updatePlaylistItem(itemId, payload);
      if (data.value?.code !== 0) {
        showToast({ message: data.value?.message || 'Failed to update song in playlist', type: 'error' });
        return;
      }

      showToast({ message: `Update ${list.value.name}`, type: 'success' });
    } finally {
    }
  };
  return {
    list,
    lists,
    isLoading,
    showFormPopup,
    formMode,
    formPlaylist,
    formLyricsIds,
    getPlaylist,
    getPlaylists,
    closeFormPopup,
    openCreatePopup,
    openUpdatePopup,
    create,
    update,
    remove,
    addItems,
    removeItem,
    updateItem,
  };
});
