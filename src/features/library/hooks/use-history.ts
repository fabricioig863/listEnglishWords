import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useCurrentUser } from '@/shared/di/current-user';

import { useLibraryRepository } from '../di';
import type { WordSnapshot } from '../domain/library';

import { libraryKeys } from './library-keys';

export function useHistory() {
  const repository = useLibraryRepository();
  const { userId } = useCurrentUser();

  return useQuery({
    queryKey: libraryKeys.history(userId),
    queryFn: () => repository.listHistory(),
    enabled: userId !== null,
  });
}

export function useRecordView(snapshot: WordSnapshot | null) {
  const repository = useLibraryRepository();
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();
  const recordedWord = useRef<string | null>(null);

  const { mutate } = useMutation({
    mutationFn: (viewed: WordSnapshot) => repository.recordView(viewed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: libraryKeys.history(userId) }),
  });

  useEffect(() => {
    if (snapshot && userId && recordedWord.current !== snapshot.word) {
      recordedWord.current = snapshot.word;
      mutate(snapshot);
    }
  }, [snapshot, userId, mutate]);
}

export function useClearHistory() {
  const repository = useLibraryRepository();
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();

  return useMutation({
    mutationFn: () => repository.clearHistory(),
    onSuccess: () => queryClient.setQueryData(libraryKeys.history(userId), []),
  });
}
