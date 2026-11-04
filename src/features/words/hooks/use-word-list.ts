import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { useWordsRepository } from '../di';
import { normalizePrefix } from '../domain/search-prefix';

export const WORD_LIST_PAGE_SIZE = 60;

export const wordListKeys = {
  all: ['words'] as const,
  list: (prefix: string) => ['words', 'list', prefix] as const,
  next: (prefix: string, word: string) => ['words', 'next', prefix, word] as const,
};

export function useWordList(searchTerm = '') {
  const repository = useWordsRepository();
  const prefix = normalizePrefix(searchTerm);

  return useInfiniteQuery({
    queryKey: wordListKeys.list(prefix),
    gcTime: 5 * 60 * 1000,
    queryFn: ({ pageParam }) =>
      repository.listWords({ limit: WORD_LIST_PAGE_SIZE, cursor: pageParam, prefix }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((page) => page.words),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
}
