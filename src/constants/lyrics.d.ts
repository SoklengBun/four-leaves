type Lyrics = {
  id: number;
  title: string;
  // legacy single-artist string (spreadsheet) or structured artists array returned by API
  artist?: string;
  artists?: Array<{ id: number; name: string }>;
  romaji?: string;
  jp?: string;
  en?: string;
  pinyin?: string;
  cn?: string;
  url?: string | { a: string; l: string }[];
};

type LyricsKeys = keyof Lyrics;
