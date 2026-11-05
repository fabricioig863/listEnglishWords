import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, type PropsWithChildren } from 'react';

import { createSupabaseAuthRepository } from '@/features/auth/data/supabase-auth-repository';
import { AuthRepositoryProvider } from '@/features/auth/di';
import { SessionProvider, useSession } from '@/features/auth/session/session-provider';
import { createHttpDictionaryRepository } from '@/features/dictionary/data/http-dictionary-repository';
import { DictionaryRepositoryProvider } from '@/features/dictionary/di';
import { createSupabaseLibraryRepository } from '@/features/library/data/supabase-library-repository';
import { LibraryRepositoryProvider } from '@/features/library/di';
import { createSqliteWordsRepository } from '@/features/words/data/sqlite-words-repository';
import { WordsRepositoryProvider } from '@/features/words/di';
import { CurrentUserProvider } from '@/shared/di/current-user';
import { supabase } from '@/shared/lib/supabase';

function CurrentUserBridge({ children }: PropsWithChildren) {
  const session = useSession();
  const userId = session.status === 'signed-in' ? session.user.id : null;
  const currentUser = useMemo(() => ({ userId }), [userId]);

  return <CurrentUserProvider value={currentUser}>{children}</CurrentUserProvider>;
}

export function AppDependencies({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const wordsRepository = useMemo(() => createSqliteWordsRepository(db), [db]);
  const dictionaryRepository = useMemo(() => createHttpDictionaryRepository(), []);
  const authRepository = useMemo(() => createSupabaseAuthRepository(supabase.auth), []);
  const libraryRepository = useMemo(() => createSupabaseLibraryRepository(supabase), []);

  return (
    <WordsRepositoryProvider value={wordsRepository}>
      <DictionaryRepositoryProvider value={dictionaryRepository}>
        <LibraryRepositoryProvider value={libraryRepository}>
          <AuthRepositoryProvider value={authRepository}>
            <SessionProvider>
              <CurrentUserBridge>{children}</CurrentUserBridge>
            </SessionProvider>
          </AuthRepositoryProvider>
        </LibraryRepositoryProvider>
      </DictionaryRepositoryProvider>
    </WordsRepositoryProvider>
  );
}
