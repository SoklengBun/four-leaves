import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getMyPlaylists } from '~/services/playlist';
import { useAuth } from '~/stores/auth';
import { normalizePlaylistItems } from '~/utils/lyrics';

export const usePlaylistStore = defineStore('playlist', () => {
  const auth = useAuth();

  const playlists = ref<Playlist[]>([]);
  const isLoading = ref(false);
  const hasLoaded = ref(false);
  const loadedForUserId = ref<number | null>(null);

  const setPlaylists = (nextPlaylists: Playlist[]) => {
    playlists.value = nextPlaylists;
    hasLoaded.value = true;
    loadedForUserId.value = auth.user?.id ?? null;
  };

  const clearPlaylists = () => {
    playlists.value = [];
    hasLoaded.value = false;
    loadedForUserId.value = null;
  };

  const fetchMine = async (force = false) => {
    const userId = auth.user?.id ?? null;

    if (!auth.isLoggedIn || !userId) {
      clearPlaylists();
      return [];
    }

    if (!force && hasLoaded.value && loadedForUserId.value === userId) {
      return playlists.value;
    }

    isLoading.value = true;
    try {
      const { data } = await getMyPlaylists();

      if (data.value?.code !== 0) {
        return playlists.value;
      }

      const nextPlaylists = Array.isArray(data.value?.data) ? data.value.data.map((item: RawPlaylist) => normalizePlaylistItems(item)) : [];

      setPlaylists(nextPlaylists);

      console.log('fetchMine', nextPlaylists);
      return nextPlaylists;
    } finally {
      isLoading.value = false;
    }
  };

  const replacePlaylist = (nextPlaylist: Playlist) => {
    hasLoaded.value = true;
    loadedForUserId.value = auth.user?.id ?? null;

    const existingIndex = playlists.value.findIndex((item) => item.id === nextPlaylist.id);

    if (existingIndex === -1) {
      playlists.value = [nextPlaylist, ...playlists.value];
      return;
    }

    playlists.value = playlists.value.map((item) => (item.id === nextPlaylist.id ? nextPlaylist : item));
  };

  return {
    playlists,
    isLoading,
    hasLoaded,
    loadedForUserId,
    setPlaylists,
    clearPlaylists,
    fetchMine,
    replacePlaylist,
  };
});
