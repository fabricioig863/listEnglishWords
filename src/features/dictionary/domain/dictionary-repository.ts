import type { WordDetails } from './word-details';

export interface DictionaryRepository {
  getWordDetails(word: string, signal?: AbortSignal): Promise<WordDetails>;
}
