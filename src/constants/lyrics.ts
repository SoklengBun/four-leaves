export const LYRICS_CONTENT_KIND_OPTIONS = [
  { key: 'japanese', label: '日本語' },
  { key: 'romaji', label: 'Romaji' },
  { key: 'english', label: 'English' },
  { key: 'chinese', label: '中文' },
  { key: 'pinyin', label: 'Pinyin' },
] as const;

export type LyricsContentKind = (typeof LYRICS_CONTENT_KIND_OPTIONS)[number]['key'];

export const DEFAULT_LYRICS_CONTENT_KIND: LyricsContentKind = 'romaji';

export const isLyricsContentKind = (kind: string): kind is LyricsContentKind => LYRICS_CONTENT_KIND_OPTIONS.some((option) => option.key === kind);

export const getLyricsContentKindLabel = (kind: LyricsContentKind) =>
  LYRICS_CONTENT_KIND_OPTIONS.find((option) => option.key === kind)?.label ?? kind;
