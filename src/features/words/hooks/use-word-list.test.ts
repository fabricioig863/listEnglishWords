import { act, waitFor } from '@testing-library/react-native';

import { renderHookWithProviders } from '@/test-utils/render';

import { useWordList, WORD_LIST_PAGE_SIZE } from './use-word-list';
import type { WordsRepository } from '../domain/words-repository';

function createRepository() {
  const listWords = jest.fn<
    ReturnType<WordsRepository['listWords']>,
    Parameters<WordsRepository['listWords']>
  >();

  return { repository: { listWords } satisfies WordsRepository, listWords };
}

describe('useWordList', () => {
  it('carrega a primeira página e expõe a lista achatada', async () => {
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

  it('busca a próxima página a partir do cursor e acumula os resultados', async () => {
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

  it('normaliza o termo de busca antes de consultar', async () => {
    const { repository, listWords } = createRepository();
    listWords.mockResolvedValueOnce({ words: ['hello'], nextCursor: null });

    await renderHookWithProviders(() => useWordList('  HeL '), {
      dependencies: { wordsRepository: repository },
    });

    await waitFor(() =>
      expect(listWords).toHaveBeenCalledWith(expect.objectContaining({ prefix: 'hel' })),
    );
  });

  it('expõe o erro quando o repositório falha', async () => {
    const { repository, listWords } = createRepository();
    listWords.mockRejectedValueOnce(new Error('disk I/O error'));

    const { result } = await renderHookWithProviders(() => useWordList(), {
      dependencies: { wordsRepository: repository },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
