import { act, waitFor } from '@testing-library/react-native';

import { renderHookWithProviders } from '@/test-utils/render';

import type { WordsRepository } from '../domain/words-repository';

import { useWordList, WORD_LIST_PAGE_SIZE } from './use-word-list';

function createRepository() {
  const listWords = jest.fn<
    ReturnType<WordsRepository['listWords']>,
    Parameters<WordsRepository['listWords']>
  >();

  return { repository: { listWords } satisfies WordsRepository, listWords };
}

describe('useWordList', () => {
  it('loads the first page and exposes a flattened list', async () => {
    const { repository, listWords } = createRepository();
    listWords.mockResolvedValueOnce({ words: ['apple', 'azure'], nextCursor: 'azure' });

    const { result } = await renderHookWithProviders(() => useWordList(), {
      dependencies: { wordsRepository: repository },
    });

    await waitFor(() => expect(result.current.data).toEqual(['apple', 'azure']));
    expect(listWords).toHaveBeenCalledWith({
      limit: WORD_LIST_PAGE_SIZE,
      cursor: null,
      prefix: '',
    });
    expect(result.current.hasNextPage).toBe(true);
  });

  it('fetches the next page from the cursor and accumulates results', async () => {
    const { repository, listWords } = createRepository();
    listWords
      .mockResolvedValueOnce({ words: ['apple', 'azure'], nextCursor: 'azure' })
      .mockResolvedValueOnce({ words: ['b'], nextCursor: null });

    const { result } = await renderHookWithProviders(() => useWordList(), {
      dependencies: { wordsRepository: repository },
    });
    await waitFor(() => expect(result.current.data).toEqual(['apple', 'azure']));

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data).toEqual(['apple', 'azure', 'b']));
    expect(listWords).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: 'azure' }));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('normalizes the search term before querying', async () => {
    const { repository, listWords } = createRepository();
    listWords.mockResolvedValueOnce({ words: ['hello'], nextCursor: null });

    await renderHookWithProviders(() => useWordList('  HeL '), {
      dependencies: { wordsRepository: repository },
    });

    await waitFor(() =>
      expect(listWords).toHaveBeenCalledWith(expect.objectContaining({ prefix: 'hel' })),
    );
  });

  it('exposes the error when the repository fails', async () => {
    const { repository, listWords } = createRepository();
    listWords.mockRejectedValueOnce(new Error('disk I/O error'));

    const { result } = await renderHookWithProviders(() => useWordList(), {
      dependencies: { wordsRepository: repository },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
