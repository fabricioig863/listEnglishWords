export type WordPage = {
  words: string[];
  nextCursor: string | null;
};

export type ListWordsParams = {
  limit: number;
  cursor?: string | null;
  prefix?: string;
};

export interface WordsRepository {
  listWords(params: ListWordsParams): Promise<WordPage>;
}
