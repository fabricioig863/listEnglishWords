import { useQuery } from '@tanstack/react-query';

import { useWordsRepository } from '../di';
import { normalizePrefix } from '../domain/search-prefix';

import { wordListKeys } from './use-word-list';

export function useNextWord(currentWord: string, searchTerm = '') {
  const repository = useWordsRepository();
  const prefix = normalizePrefix(searchTerm);

  return useQuery({
    queryKey: wordListKeys.next(prefix, currentWord),
    queryFn: async () => {
      const page = await repository.listWords({ limit: 1, cursor: currentWord, prefix });

      return page.words[0] ?? null;
    },
    staleTime: Infinity,
  });
}
