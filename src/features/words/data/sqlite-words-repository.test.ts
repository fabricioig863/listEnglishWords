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

  it('retorna a primeira página em ordem alfabética', async () => {
    const page = await repository.listWords({ limit: 3 });

    expect(page).toEqual({ words: ['apple', 'azure', 'b'], nextCursor: 'b' });
  });

  it('continua a partir do cursor', async () => {
    const page = await repository.listWords({ limit: 3, cursor: 'b' });

    expect(page.words).toEqual(['hel', 'helium', 'hello']);
  });

  it('sinaliza o fim da lista com nextCursor nulo', async () => {
    const page = await repository.listWords({ limit: 3, cursor: 'zebra' });

    expect(page).toEqual({ words: ['zz', 'zzz'], nextCursor: null });
  });

  it('não indica próxima página quando a última página fica exatamente cheia', async () => {
    const page = await repository.listWords({ limit: 3, cursor: 'hem' });

    expect(page).toEqual({ words: ['zebra', 'zz', 'zzz'], nextCursor: null });
  });

  it('filtra pelo prefixo', async () => {
    const page = await repository.listWords({ limit: 10, prefix: 'hel' });

    expect(page.words).toEqual(['hel', 'helium', 'hello', 'helm', 'help']);
  });

  it('pagina dentro do prefixo', async () => {
    const page = await repository.listWords({ limit: 10, prefix: 'hel', cursor: 'hello' });

    expect(page.words).toEqual(['helm', 'help']);
  });

  it('trata prefixo terminado em "z"', async () => {
    const page = await repository.listWords({ limit: 10, prefix: 'az' });

    expect(page.words).toEqual(['azure']);
  });

  it('trata prefixo sem limite superior', async () => {
    const page = await repository.listWords({ limit: 10, prefix: 'zz' });

    expect(page.words).toEqual(['zz', 'zzz']);
  });

  it('retorna página vazia para prefixo inválido sem consultar o banco', async () => {
    const page = await repository.listWords({ limit: 10, prefix: "don't" });

    expect(page).toEqual({ words: [], nextCursor: null });
  });
});
