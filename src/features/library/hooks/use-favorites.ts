import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/shared/di/current-user';

import { useLibraryRepository } from '../di';
import type { FavoriteItem, WordSnapshot } from '../domain/library';

import { libraryKeys } from './library-keys';

export function useFavorites() {
  const repository = useLibraryRepository();
  const { userId } = useCurrentUser();

  return useQuery({
    queryKey: libraryKeys.favorites(userId),
    queryFn: () => repository.listFavorites(),
    enabled: userId !== null,
  });
}

export function useIsFavorite(word: string) {
  const { data } = useFavorites();

  return data?.some((favorite) => favorite.word === word) ?? false;
}

type ToggleFavoriteVariables = {
  snapshot: WordSnapshot;
  isFavorite: boolean;
};

export function useToggleFavorite() {
  const repository = useLibraryRepository();
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();
  const queryKey = libraryKeys.favorites(userId);

  return useMutation({
    mutationFn: ({ snapshot, isFavorite }: ToggleFavoriteVariables) =>
      isFavorite ? repository.removeFavorite(snapshot.word) : repository.addFavorite(snapshot),

    onMutate: async ({ snapshot, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FavoriteItem[]>(queryKey);

      queryClient.setQueryData<FavoriteItem[]>(queryKey, (current = []) =>
        isFavorite
          ? current.filter((favorite) => favorite.word !== snapshot.word)
          : [{ ...snapshot, createdAt: new Date().toISOString() }, ...current],
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
