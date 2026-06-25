type HomeArtist = {
  id: number;
  name: string;
  altName?: string | null;
  cv?: {
    id?: number | null;
    name?: string | null;
    altName?: string | null;
  } | null;
};

type HomeCover = {
  id?: string | null;
  videoId?: string | null;
  youtubeId?: string | null;
  artists?: HomeArtist[] | null;
};

type HomeContent = {
  kind?: string | null;
  type?: string | null;
  language?: string | null;
  content?: string | null;
  text?: string | null;
  value?: string | null;
};

export type HomeSong = {
  id: number;
  videoId?: string | null;
  video_id?: string | null;
  youtubeId?: string | null;
  title?: string | null;
  name?: string | null;
  altTitles?: string[] | null;
  artists?: HomeArtist[] | null;
  covers?: HomeCover[] | null;
  contents?: HomeContent[] | null;
  jp?: string | null;
  en?: string | null;
  romaji?: string | null;
  pinyin?: string | null;
  cn?: string | null;
};

const lyricContentKindMap: Partial<Record<string, LyricsKeys>> = {
  japanese: 'jp',
  english: 'en',
  romaji: 'romaji',
  translation: 'cn',
  chinese: 'cn',
  pinyin: 'pinyin',
  jp: 'jp',
  en: 'en',
  cn: 'cn',
};

export const extractYoutubeVideoId = (value?: string | null) => {
  const trimmedValue = String(value ?? '').trim();
  if (!trimmedValue) return '';

  if (/^[\w-]{11}$/.test(trimmedValue)) return trimmedValue;

  try {
    const url = new URL(trimmedValue);
    const videoParam = url.searchParams.get('v');
    if (videoParam?.match(/^[\w-]{11}$/)) return videoParam;

    const pathParts = url.pathname.split('/').filter(Boolean);
    const pathId = url.hostname.includes('youtu.be') ? pathParts[0] : pathParts.find((part) => part.match(/^[\w-]{11}$/));
    if (pathId?.match(/^[\w-]{11}$/)) return pathId;
  } catch {
    const videoParam = trimmedValue.match(/[?&]v=([\w-]{11})/);
    if (videoParam) return videoParam[1];

    const shortUrlId = trimmedValue.match(/youtu\.be\/([\w-]{11})/);
    if (shortUrlId) return shortUrlId[1];
  }

  return '';
};

export const getLyricsArtistLabel = (song?: Pick<Lyrics, 'artist' | 'artists'> | null) => {
  if (!song) return '';
  if (song.artist) return song.artist;
  if (song.artists?.length) return song.artists.map((artist) => getLyricsArtistName(artist)).join(', ');
  return '';
};

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

export const getLyricsCvLabel = (
  artist?: {
    cv?: {
      name?: string | null;
      altName?: string | null;
    } | null;
  } | null,
) => {
  if (!artist?.cv?.name) return '';

  const cvAltName = secondaryName(artist.cv.name, artist.cv.altName);
  return cvAltName ? `CV: ${artist.cv.name} / ${cvAltName}` : `CV: ${artist.cv.name}`;
};

export const getLyricsArtistName = (
  artist?: {
    name?: string | null;
    altName?: string | null;
    cv?: {
      name?: string | null;
      altName?: string | null;
    } | null;
  } | null,
) => {
  const name = String(artist?.name ?? '').trim();
  if (!name) return '';

  const altName = secondaryName(name, artist?.altName);
  const displayName = altName ? `${name} / ${altName}` : name;
  const cvLabel = getLyricsCvLabel(artist);

  return cvLabel ? `${displayName} (${cvLabel})` : displayName;
};

const normalizeUrlVariants = (song: HomeSong) => {
  const primaryVideo = String(song.videoId ?? song.video_id ?? song.youtubeId ?? '').trim();
  const primaryArtist = getLyricsArtistLabel({
    artist: undefined,
    artists: (song.artists ?? []).map((artist) => ({
      id: Number(artist.id),
      name: String(artist.name ?? '').trim(),
      altName: String(artist.altName ?? '').trim() || undefined,
      cv: artist.cv?.name
        ? {
            id: Number.isFinite(Number(artist.cv.id)) ? Number(artist.cv.id) : undefined,
            name: String(artist.cv.name ?? '').trim(),
            altName: String(artist.cv.altName ?? '').trim() || undefined,
          }
        : null,
    })),
  });

  const variants = [
    ...(primaryVideo
      ? [
          {
            a: primaryArtist || 'Original',
            l: primaryVideo,
          },
        ]
      : []),
    ...((song.covers ?? []).map((cover) => ({
      a:
        cover.artists
          ?.map((artist) =>
            getLyricsArtistName({
              name: String(artist.name ?? '').trim(),
              altName: String(artist.altName ?? '').trim() || undefined,
              cv: artist.cv?.name
                ? {
                    name: String(artist.cv.name ?? '').trim(),
                    altName: String(artist.cv.altName ?? '').trim() || undefined,
                  }
                : null,
            }),
          )
          .filter(Boolean)
          .join(', ') ||
        primaryArtist ||
        'Cover',
      l: String(cover.videoId ?? cover.youtubeId ?? cover.id ?? '').trim(),
    })) ?? []),
  ].filter((item) => item.l);

  const deduped = variants.filter((item, index, source) => source.findIndex((entry) => entry.l === item.l) === index);

  if (!deduped.length) return undefined;
  if (deduped.length === 1 && deduped[0].a === 'Original') return deduped[0].l;
  return deduped;
};

const normalizeContents = (song: HomeSong) => {
  const normalized: Partial<Lyrics> = {};

  (song.contents ?? []).forEach((entry) => {
    const key = String(entry.kind ?? entry.type ?? entry.language ?? '')
      .trim()
      .toLowerCase();
    const target = lyricContentKindMap[key];
    const content = String(entry.content ?? entry.text ?? entry.value ?? '').trim();

    if (target && content) {
      normalized[target] = content as never;
    }
  });

  (['jp', 'en', 'romaji', 'pinyin', 'cn'] as const).forEach((key) => {
    const content = String(song[key] ?? '').trim();
    if (content) normalized[key] = content as never;
  });

  return normalized;
};

export const normalizeLyrics = (song: HomeSong): Lyrics => ({
  id: Number(song.id),
  createdAt: undefined,
  updatedAt: undefined,
  deletedAt: null,
  videoId: String(song.videoId ?? song.video_id ?? song.youtubeId ?? '').trim(),
  title: String(song.title ?? song.name ?? '').trim(),
  altTitles: (song.altTitles ?? []).map((item) => String(item ?? '').trim()).filter(Boolean),
  artists: (song.artists ?? [])
    .map((artist) => ({
      id: Number(artist.id),
      name: String(artist.name ?? '').trim(),
      altName: String(artist.altName ?? '').trim() || undefined,
      cv: artist.cv?.name
        ? {
            id: Number.isFinite(Number(artist.cv.id)) ? Number(artist.cv.id) : undefined,
            name: String(artist.cv.name ?? '').trim(),
            altName: String(artist.cv.altName ?? '').trim() || undefined,
          }
        : null,
    }))
    .filter((artist) => Number.isFinite(artist.id) && artist.name),
  contents: song.contents
    ?.map((entry) => ({
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      deletedAt: null,
      lyricsId: Number(song.id),
      kind: String(entry.kind ?? entry.type ?? entry.language ?? '').trim(),
      content: String(entry.content ?? entry.text ?? entry.value ?? '').trim(),
    }))
    .filter((entry) => entry.kind && entry.content),
  covers: (song.covers ?? [])
    .map((cover) => ({
      createdAt: undefined,
      updatedAt: undefined,
      deletedAt: null,
      lyricsId: Number(song.id),
      id: String(cover.videoId ?? cover.youtubeId ?? cover.id ?? '').trim(),
      artists: (cover.artists ?? [])
        .map((artist) => ({
          id: Number(artist.id),
          name: String(artist.name ?? '').trim(),
          altName: String(artist.altName ?? '').trim() || undefined,
          cvId: artist.cv?.id ? Number(artist.cv.id) : undefined,
          cv: artist.cv?.name
            ? {
                id: Number.isFinite(Number(artist.cv.id)) ? Number(artist.cv.id) : undefined,
                name: String(artist.cv.name ?? '').trim(),
                altName: String(artist.cv.altName ?? '').trim() || undefined,
              }
            : null,
        }))
        .filter((artist) => Number.isFinite(artist.id) && artist.name),
    }))
    .filter((cover) => cover.id),
  createdById: undefined,
  url: normalizeUrlVariants(song),
  ...normalizeContents(song),
});

export const hasLyricsContent = (song?: Lyrics | null) => Boolean(song?.jp || song?.romaji || song?.en || song?.pinyin || song?.cn);
