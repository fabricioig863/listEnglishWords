import { waitFor } from '@testing-library/react-native';

import { renderHookWithProviders } from '@/test-utils/render';

import type { WordsRepository } from '../domain/words-repository';

import { useNextWord } from './use-next-word';

function renderUseNextWord(word: string, searchTerm: string, listWords: jest.Mock) {
  const wordsRepository: WordsRepository = { listWords };

  return renderHookWithProviders(() => useNextWord(word, searchTerm), {
    dependencies: { wordsRepository },
  });
}

describe('useNextWord', () => {
  it('busca a palavra seguinte a partir da atual, respeitando o prefixo', async () => {
    const listWords = jest.fn().mockResolvedValue({ words: ['helm'], nextCursor: 'helm' });

    const { result } = await renderUseNextWord('hello', ' HeL ', listWords);

    await waitFor(() => expect(result.current.data).toBe('helm'));
    expect(listWords).toHaveBeenCalledWith({ limit: 1, cursor: 'hello', prefix: 'hel' });
  });

  it('devolve null no fim da lista', async () => {
    const listWords = jest.fn().mockResolvedValue({ words: [], nextCursor: null });

    const { result } = await renderUseNextWord('zyzzyva', '', listWords);

    await waitFor(() => expect(result.current.data).toBeNull());
  });
});
