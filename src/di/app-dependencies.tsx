import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, type PropsWithChildren } from 'react';

import { createSqliteWordsRepository } from '@/features/words/data/sqlite-words-repository';
import { WordsRepositoryProvider } from '@/features/words/di';

export function AppDependencies({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const wordsRepository = useMemo(() => createSqliteWordsRepository(db), [db]);

  return <WordsRepositoryProvider value={wordsRepository}>{children}</WordsRepositoryProvider>;
}
