type LyricsArtist = {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  altName?: string;
  cvId?: number | null;
  cv?: {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    name: string;
    altName?: string;
  } | null;
};

type LyricsContent = {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  lyricsId?: number;
  kind: string;
  content: string;
};

type LyricsCover = {
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  lyricsId?: number;
  id: string;
  artists?: LyricsArtist[];
};

type LyricsVersion = {
  a: string;
  l: string;
};

type Lyrics = {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  videoId: string;
  title: string;
  altTitles: string[];
  artists: LyricsArtist[];
  contents?: LyricsContent[];
  covers?: LyricsCover[];
  createdById?: number;
  // legacy single-artist string or derived display helper
  artist?: string;
  // flattened/derived lyric content used by the current UI
  romaji?: string;
  jp?: string;
  en?: string;
  pinyin?: string;
  cn?: string;
  // derived playback urls used by the current player UI
  url?: string | LyricsVersion[];
};

type LyricsKeys = keyof Lyrics;
