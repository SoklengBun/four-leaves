type Lyrics = {
  id: number;
  title: string;
  artist: string;
  romaji?: string;
  jp?: string;
  en?: string;
  pinyin?: string;
  cn?: string;
  url?: string | { a: string; l: string }[];
};

type LyricsKeys = keyof Lyrics;
