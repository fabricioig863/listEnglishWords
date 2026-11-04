import { ThemeProvider } from '@shopify/restyle';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useState, type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WORDS_DATABASE } from '@/shared/database/words-database';
import {
  createQueryClient,
  QUERY_CACHE_MAX_AGE,
  shouldPersistQuery,
} from '@/shared/lib/query-client';
import { QUERY_CACHE_VERSION, queryPersister } from '@/shared/lib/query-persister';
import { theme } from '@/shared/theme/theme';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: queryPersister,
          maxAge: QUERY_CACHE_MAX_AGE,
          buster: QUERY_CACHE_VERSION,
          dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
        }}
      >
        <SQLiteProvider
          databaseName={WORDS_DATABASE.name}
          assetSource={{ assetId: WORDS_DATABASE.asset }}
        >
          <ThemeProvider theme={theme}>
            <StatusBar style="dark" />
            {children}
          </ThemeProvider>
        </SQLiteProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
