import { ThemeProvider } from '@shopify/restyle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions,
} from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import { AuthRepositoryProvider } from '@/features/auth/di';
import type { AuthRepository } from '@/features/auth/domain/auth-repository';
import { DictionaryRepositoryProvider } from '@/features/dictionary/di';
import type { DictionaryRepository } from '@/features/dictionary/domain/dictionary-repository';
import { WordsRepositoryProvider } from '@/features/words/di';
import type { WordsRepository } from '@/features/words/domain/words-repository';
import { theme } from '@/shared/theme/theme';

export type TestDependencies = {
  wordsRepository?: WordsRepository;
  dictionaryRepository?: DictionaryRepository;
  authRepository?: AuthRepository;
};

type ProviderOptions = {
  queryClient?: QueryClient;
  dependencies?: TestDependencies;
};

const TEST_SAFE_AREA: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function createWrapper({
  queryClient,
  dependencies = {},
}: Required<Pick<ProviderOptions, 'queryClient'>> & ProviderOptions) {
  return function TestProviders({ children }: PropsWithChildren) {
    let content = <ThemeProvider theme={theme}>{children}</ThemeProvider>;

    if (dependencies.wordsRepository) {
      content = (
        <WordsRepositoryProvider value={dependencies.wordsRepository}>
          {content}
        </WordsRepositoryProvider>
      );
    }

    if (dependencies.dictionaryRepository) {
      content = (
        <DictionaryRepositoryProvider value={dependencies.dictionaryRepository}>
          {content}
        </DictionaryRepositoryProvider>
      );
    }

    if (dependencies.authRepository) {
      content = (
        <AuthRepositoryProvider value={dependencies.authRepository}>
          {content}
        </AuthRepositoryProvider>
      );
    }

    return (
      <SafeAreaProvider initialMetrics={TEST_SAFE_AREA}>
        <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>
      </SafeAreaProvider>
    );
  };
}

export async function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    dependencies,
    ...options
  }: RenderOptions & ProviderOptions = {},
) {
  const result = await render(ui, {
    ...options,
    wrapper: createWrapper({ queryClient, dependencies }),
  });

  return { ...result, queryClient };
}

export async function renderHookWithProviders<Result, Props>(
  hook: (props: Props) => Result,
  {
    queryClient = createTestQueryClient(),
    dependencies,
    ...options
  }: RenderHookOptions<Props> & ProviderOptions = {},
) {
  const result = await renderHook(hook, {
    ...options,
    wrapper: createWrapper({ queryClient, dependencies }),
  });

  return { ...result, queryClient };
}
