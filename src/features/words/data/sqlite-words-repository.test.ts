import { DatabaseSync } from 'node:sqlite';

import { createSqliteWordsRepository, type WordsDatabase } from './sqlite-words-repository';

const WORDS = [
  'apple',
  'azure',
  'b',
  'hel',
  'helium',
  'hello',
  'helm',
  'help',
  'hem',
  'zebra',
  'zz',
  'zzz',
];

function createTestDatabase(words: string[]): WordsDatabase {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE words (word TEXT PRIMARY KEY NOT NULL) WITHOUT ROWID;');

  const insert = db.prepare('INSERT INTO words (word) VALUES (?)');
  words.forEach((word) => insert.run(word));

  return {
    getAllAsync: async (sql: string, params: (string | number)[]) => db.prepare(sql).all(...params),
  } as WordsDatabase;
}

describe('SqliteWordsRepository', () => {
  const repository = createSqliteWordsRepository(createTestDatabase(WORDS));

  it('returns the first page in alphabetical order', async () => {
    const page = await repository.listWords({ limit: 3 });

    expect(page).toEqual({ words: ['apple', 'azure', 'b'], nextCursor: 'b' });
  });

  it('continues from the cursor', async () => {
    const page = await repository.listWords({ limit: 3, cursor: 'b' });

    expect(page.words).toEqual(['hel', 'helium', 'hello']);
  });

  it('signals the end of the list with a null nextCursor', async () => {
    const page = await repository.listWords({ limit: 3, cursor: 'zebra' });

    expect(page).toEqual({ words: ['zz', 'zzz'], nextCursor: null });
  });

  it('does not report a next page when the last page is exactly full', async () => {
    const page = await repository.listWords({ limit: 3, cursor: 'hem' });

    expect(page).toEqual({ words: ['zebra', 'zz', 'zzz'], nextCursor: null });
  });

  it('filters by prefix', async () => {
    const page = await repository.listWords({ limit: 10, prefix: 'hel' });

    expect(page.words).toEqual(['hel', 'helium', 'hello', 'helm', 'help']);
  });

  it('paginates within the prefix', async () => {
    const page = await repository.listWords({ limit: 10, prefix: 'hel', cursor: 'hello' });

    expect(page.words).toEqual(['helm', 'help']);
  });

  it('handles a prefix ending in "z"', async () => {
    const page = await repository.listWords({ limit: 10, prefix: 'az' });

    expect(page.words).toEqual(['azure']);
  });

  it('handles a prefix without an upper bound', async () => {
    const page = await repository.listWords({ limit: 10, prefix: 'zz' });

    expect(page.words).toEqual(['zz', 'zzz']);
  });

  it('returns an empty page for an invalid prefix without querying the database', async () => {
    const page = await repository.listWords({ limit: 10, prefix: "don't" });

    expect(page).toEqual({ words: [], nextCursor: null });
  });
});
