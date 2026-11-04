import { ThemeProvider } from '@shopify/restyle';
import { QueryClientProvider } from '@tanstack/react-query';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useState, type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createQueryClient } from '@/shared/lib/query-client';
import { theme } from '@/shared/theme/theme';

import { WORDS_DATABASE } from '../database/words-database';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider
          databaseName={WORDS_DATABASE.name}
          assetSource={{ assetId: WORDS_DATABASE.asset }}
        >
          <ThemeProvider theme={theme}>
            <StatusBar style="dark" />
            {children}
          </ThemeProvider>
        </SQLiteProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
