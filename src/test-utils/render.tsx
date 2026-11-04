import { ThemeProvider } from '@shopify/restyle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions,
} from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';

import { WordsRepositoryProvider } from '@/features/words/di';
import type { WordsRepository } from '@/features/words/domain/words-repository';
import { theme } from '@/shared/theme/theme';

export type TestDependencies = {
  wordsRepository?: WordsRepository;
};

type ProviderOptions = {
  queryClient?: QueryClient;
  dependencies?: TestDependencies;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
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

    return <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>;
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
