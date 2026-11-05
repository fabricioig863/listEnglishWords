import { ThemeProvider } from '@shopify/restyle';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WORDS_DATABASE } from '@/shared/database/words-database';
import {
  createQueryClient,
  QUERY_CACHE_MAX_AGE,
  shouldPersistQuery,
} from '@/shared/lib/query-client';
import { QUERY_CACHE_VERSION, queryPersister } from '@/shared/lib/query-persister';
import { darkTheme, theme } from '@/shared/theme/theme';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);
  const colorScheme = useColorScheme();

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
          <ThemeProvider theme={colorScheme === 'dark' ? darkTheme : theme}>
            <StatusBar style="auto" />

            {children}
          </ThemeProvider>
        </SQLiteProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
