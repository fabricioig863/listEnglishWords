import type { SQLiteDatabase } from 'expo-sqlite';

import { getPrefixUpperBound, isSearchablePrefix } from '../domain/search-prefix';
import type { ListWordsParams, WordPage, WordsRepository } from '../domain/words-repository';

export type WordsDatabase = Pick<SQLiteDatabase, 'getAllAsync'>;

const EMPTY_PAGE: WordPage = { words: [], nextCursor: null };

export function createSqliteWordsRepository(db: WordsDatabase): WordsRepository {
  return {
    async listWords({ limit, cursor, prefix }: ListWordsParams): Promise<WordPage> {
      if (prefix !== undefined && prefix !== '' && !isSearchablePrefix(prefix)) {
        return EMPTY_PAGE;
      }

      const conditions: string[] = [];
      const params: (string | number)[] = [];

      if (cursor) {
        conditions.push('word > ?');
        params.push(cursor);
      }

      if (prefix) {
        conditions.push('word >= ?');
        params.push(prefix);

        const upperBound = getPrefixUpperBound(prefix);
        if (upperBound) {
          conditions.push('word < ?');
          params.push(upperBound);
        }
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const rows = await db.getAllAsync<{ word: string }>(
        `SELECT word FROM words ${where} ORDER BY word LIMIT ?`,
        [...params, limit + 1],
      );

      const hasMore = rows.length > limit;
      const words = rows.slice(0, limit).map((row) => row.word);

      return {
        words,
        nextCursor: hasMore ? words[words.length - 1] : null,
      };
    },
  };
}
