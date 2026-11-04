import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, type PropsWithChildren } from 'react';

import { createHttpDictionaryRepository } from '@/features/dictionary/data/http-dictionary-repository';
import { DictionaryRepositoryProvider } from '@/features/dictionary/di';
import { createSqliteWordsRepository } from '@/features/words/data/sqlite-words-repository';
import { WordsRepositoryProvider } from '@/features/words/di';

export function AppDependencies({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const wordsRepository = useMemo(() => createSqliteWordsRepository(db), [db]);
  const dictionaryRepository = useMemo(() => createHttpDictionaryRepository(), []);

  return (
    <WordsRepositoryProvider value={wordsRepository}>
      <DictionaryRepositoryProvider value={dictionaryRepository}>
        {children}
      </DictionaryRepositoryProvider>
    </WordsRepositoryProvider>
  );
}
