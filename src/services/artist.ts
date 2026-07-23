import useAppFetch from '.';

export type ArtistPayload = {
  name: string;
  altName?: string;
  cvId?: number;
};

export const createArtist = (payload: ArtistPayload) => {
  return useAppFetch('artist/add').post(payload).json();
};

export const updateArtist = (artistId: number | string, payload: ArtistPayload) => {
  return useAppFetch(`artist/${encodeURIComponent(String(artistId))}`).put(payload).json();
};
