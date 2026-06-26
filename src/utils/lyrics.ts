const secondaryName = (name?: string | null, altName?: string | null) => {
  const primary = String(name ?? '').trim();
  const secondary = String(altName ?? '').trim();
  if (!primary || !secondary || secondary === primary) return '';
  return secondary;
};

export const getLyricsTitleLabel = (song?: Pick<Lyrics, 'title' | 'altTitles'> | null) => {
  if (!song) return '';
  const altTitle = song.altTitles?.find((item) => {
    const normalized = String(item ?? '').trim();
    return normalized && normalized !== song.title;
  });

  return altTitle ? `${song.title} / ${altTitle}` : song.title;
};

export const getLyricsCvLabel = (artist?: LyricsArtist) => {
  if (!artist?.cv?.name) return '';

  const cvAltName = secondaryName(artist.cv.name, artist.cv.altName);
  return cvAltName ? `CV: ${artist.cv.name} / ${cvAltName}` : `CV: ${artist.cv.name}`;
};

export const getLyricsArtistName = (artist?: LyricsArtist) => {
  const name = String(artist?.name ?? '').trim();
  if (!name) return '';

  const altName = secondaryName(name, artist?.altName);
  const displayName = altName ? `${name} / ${altName}` : name;
  const cvLabel = getLyricsCvLabel(artist);

  return cvLabel ? `${displayName} (${cvLabel})` : displayName;
};

export const getLyricsArtistsLabel = (artists?: LyricsArtist[] | null) => {
  if (!artists?.length) return '';
  return artists.map((artist) => getLyricsArtistName(artist)).join(', ');
};

export const normalizePlaylistItems = (playlist?: RawPlaylist | null): Playlist => {
  const items = Array.isArray(playlist?.items)
    ? playlist.items.map((item: RawPlaylistItem) => {
        return { ...item.song, note: item.note, defaultCoverId: item.defaultCoverId } as PlaylistItem;
      })
    : [];

  console.log('normalizePlaylistItems', playlist, items);
  return {
    id: playlist?.id ?? 0,
    name: playlist?.name ?? '',
    description: playlist?.description ?? '',
    isPublic: !!playlist?.isPublic,
    createdById: playlist?.createdById,
    items,
  };
};
