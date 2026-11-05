import { act, waitFor } from '@testing-library/react-native';

import { renderHookWithProviders, TEST_USER_ID } from '@/test-utils/render';

import type { LibraryRepository, WordSnapshot } from '../domain/library';

import { libraryKeys } from './library-keys';
import { useFavorites, useToggleFavorite } from './use-favorites';

const HELLO: WordSnapshot = {
  word: 'hello',
  phonetic: '/həˈləʊ/',
  partOfSpeech: 'noun',
  firstDefinition: 'A greeting.',
  hasDefinition: true,
};

function createRepository(overrides: Partial<LibraryRepository> = {}): LibraryRepository {
  return {
    listFavorites: jest.fn().mockResolvedValue([]),
    addFavorite: jest.fn().mockResolvedValue(undefined),
    removeFavorite: jest.fn().mockResolvedValue(undefined),
    listHistory: jest.fn().mockResolvedValue([]),
    recordView: jest.fn().mockResolvedValue(undefined),
    clearHistory: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function renderFavorites(repository: LibraryRepository) {
  return renderHookWithProviders(
    () => ({ favorites: useFavorites(), toggle: useToggleFavorite() }),
    { dependencies: { libraryRepository: repository } },
  );
}

describe('useToggleFavorite', () => {
  it('desfaz a mudança otimista quando o servidor falha', async () => {
    const repository = createRepository({
      addFavorite: jest.fn().mockRejectedValue(new Error('offline')),
    });
    const { result, queryClient } = await renderFavorites(repository);
    await waitFor(() => expect(result.current.favorites.data).toEqual([]));

    await act(async () => {
      result.current.toggle.mutate({ snapshot: HELLO, isFavorite: false });
    });

    await waitFor(() => expect(result.current.toggle.isError).toBe(true));
    expect(queryClient.getQueryData(libraryKeys.favorites(TEST_USER_ID))).toEqual([]);
  });

  it('mantém o favorito após o servidor confirmar', async () => {
    const repository = createRepository({
      listFavorites: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValue([{ ...HELLO, createdAt: '2026-11-05T10:00:00Z' }]),
    });
    const { result } = await renderFavorites(repository);
    await waitFor(() => expect(result.current.favorites.data).toEqual([]));

    await act(async () => {
      result.current.toggle.mutate({ snapshot: HELLO, isFavorite: false });
    });

    await waitFor(() => expect(result.current.favorites.data?.[0]?.word).toBe('hello'));
    expect(repository.addFavorite).toHaveBeenCalledWith(HELLO);
  });
});
