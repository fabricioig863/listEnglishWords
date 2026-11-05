export type WordSnapshot = {
  word: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  firstDefinition: string | null;
  hasDefinition: boolean;
};

export type FavoriteItem = WordSnapshot & { createdAt: string };

export type HistoryItem = Omit<WordSnapshot, 'firstDefinition'> & { viewedAt: string };

export interface LibraryRepository {
  listFavorites(): Promise<FavoriteItem[]>;
  addFavorite(snapshot: WordSnapshot): Promise<void>;
  removeFavorite(word: string): Promise<void>;
  listHistory(): Promise<HistoryItem[]>;
  recordView(snapshot: WordSnapshot): Promise<void>;
  clearHistory(): Promise<void>;
}
