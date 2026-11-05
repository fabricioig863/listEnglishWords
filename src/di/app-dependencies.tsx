import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, type PropsWithChildren } from 'react';

import { createSupabaseAuthRepository } from '@/features/auth/data/supabase-auth-repository';
import { AuthRepositoryProvider } from '@/features/auth/di';
import { SessionProvider } from '@/features/auth/session/session-provider';
import { createHttpDictionaryRepository } from '@/features/dictionary/data/http-dictionary-repository';
import { DictionaryRepositoryProvider } from '@/features/dictionary/di';
import { createSqliteWordsRepository } from '@/features/words/data/sqlite-words-repository';
import { WordsRepositoryProvider } from '@/features/words/di';
import { supabase } from '@/shared/lib/supabase';

export function AppDependencies({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const wordsRepository = useMemo(() => createSqliteWordsRepository(db), [db]);
  const dictionaryRepository = useMemo(() => createHttpDictionaryRepository(), []);
  const authRepository = useMemo(() => createSupabaseAuthRepository(supabase.auth), []);

  return (
    <WordsRepositoryProvider value={wordsRepository}>
      <DictionaryRepositoryProvider value={dictionaryRepository}>
        <AuthRepositoryProvider value={authRepository}>
          <SessionProvider>{children}</SessionProvider>
        </AuthRepositoryProvider>
      </DictionaryRepositoryProvider>
    </WordsRepositoryProvider>
  );
}
