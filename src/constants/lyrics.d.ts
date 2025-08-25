type Lyrics = {
  id: number;
  title: string;
  artist: string;
  romaji?: string;
  jp?: string;
  en?: string;
  url?: string | { a: string; l: string }[];
};
