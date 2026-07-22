type CreatePlaylist = {
  name: string;
  description: string;
  isPublic: boolean;
  lyricsIds: number[];
};

type AddToPlaylist = {
  lyricsIds: number[];
};

type UpdatePlaylist = CreatePlaylist;

type UpdatePlaylistItem = {
  defaultCoverId?: string;
  note?: string;
};

type ReorderPlaylistItems = {
  itemOrders: {
    itemId: number;
    position: number;
  }[];
};
