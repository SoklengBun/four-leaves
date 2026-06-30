type LyricsArtist = Base & {
  name: string;
  altName?: string;
  cvId?: number | null;
  cv?: LyricsArtist | null;
};

type LyricsContent = Base & {
  lyricsId?: number;
  kind: string;
  content: string;
};

type LyricsCover = Omit<Base, 'id'> & {
  id: string;
  lyricsId?: number;
  artists?: LyricsArtist[];
};

type Lyrics = Base & {
  videoId: string;
  title: string;
  altTitles: string[];
  artists: LyricsArtist[];
  contents?: LyricsContent[];
  covers?: LyricsCover[];
  createdById?: number;
};

type PlaylistItem = Lyrics & {
  playlistItemId?: number;
  note?: string;
  defaultCoverId?: string;
};

type Playlist = Base & {
  name: string;
  description: string;
  isPublic: boolean;
  createdById?: number;
  items: PlaylistItem[];
};

type RawPlaylistItem = {
  id: number;
  note?: string;
  defaultCoverId?: string;
  song: Lyrics;
};

type RawPlaylist = Base & {
  name: string;
  description: string;
  isPublic: boolean;
  createdById?: number;
  items: RawPlaylistItem[];
};

type LyricsKeys = 'romaji' | 'pinyin' | 'japanese' | 'english' | 'chinese';
