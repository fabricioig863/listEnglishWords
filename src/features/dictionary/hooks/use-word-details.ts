import { useQuery } from '@tanstack/react-query';

import { useDictionaryRepository } from '../di';
import { isDictionaryError, type DictionaryErrorKind } from '../domain/dictionary-error';

const RETRYABLE_ERRORS: ReadonlySet<DictionaryErrorKind> = new Set([
  'server',
  'network',
  'timeout',
]);
const MAX_RETRIES = 2;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const wordDetailsKeys = {
  all: ['dictionary'] as const,
  detail: (word: string) => ['dictionary', 'word', word] as const,
};

export function shouldRetryWordDetails(failureCount: number, error: unknown): boolean {
  return isDictionaryError(error) && RETRYABLE_ERRORS.has(error.kind) && failureCount < MAX_RETRIES;
}

export function useWordDetails(word: string) {
  const repository = useDictionaryRepository();

  return useQuery({
    queryKey: wordDetailsKeys.detail(word),
    queryFn: ({ signal }) => repository.getWordDetails(word, signal),
    retry: shouldRetryWordDetails,
    staleTime: ONE_DAY_MS,
    enabled: word.length > 0,
  });
}
