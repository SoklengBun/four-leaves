import useAppFetch from '.';

export type ArtistPayload = {
  name: string;
  altName?: string;
  cvId?: number;
};

export const getArtistById = async (artistId: number | string) => {
  const { data } = await useAppFetch(`artist/${encodeURIComponent(String(artistId))}`).get().json();
  const response = data.value;

  if (response?.code !== undefined && response.code !== 0) {
    throw new Error(response.message || 'Unable to load artist');
  }

  const payload = response?.data ?? response;
  const artist = payload?.artist ?? payload;

  if (!artist || typeof artist !== 'object' || Array.isArray(artist)) {
    throw new Error('Unable to load artist');
  }

  return artist as LyricsArtist;
};

export const createArtist = (payload: ArtistPayload) => {
  return useAppFetch('artist/add').post(payload).json();
};

export const updateArtist = (artistId: number | string, payload: ArtistPayload) => {
  return useAppFetch(`artist/${encodeURIComponent(String(artistId))}`).put(payload).json();
};
