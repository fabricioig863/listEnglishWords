import { waitFor } from '@testing-library/react-native';

import { renderHookWithProviders } from '@/test-utils/render';

import { DictionaryError } from '../domain/dictionary-error';
import type { DictionaryRepository } from '../domain/dictionary-repository';
import type { WordDetails } from '../domain/word-details';

import { shouldRetryWordDetails, useWordDetails, wordDetailsKeys } from './use-word-details';

const HELLO: WordDetails = {
  word: 'hello',
  phonetics: [{ text: '/həˈləʊ/', accent: 'UK' }],
  audios: [],
  meanings: [{ partOfSpeech: 'noun', definitions: [{ text: 'A greeting.', example: null }] }],
};

function renderUseWordDetails(word: string, getWordDetails: jest.Mock) {
  const dictionaryRepository: DictionaryRepository = { getWordDetails };

  return renderHookWithProviders(() => useWordDetails(word), {
    dependencies: { dictionaryRepository },
  });
}

describe('useWordDetails', () => {
  it('carrega os detalhes repassando o sinal de cancelamento', async () => {
    const getWordDetails = jest.fn().mockResolvedValue(HELLO);

    const { result } = await renderUseWordDetails('hello', getWordDetails);

    await waitFor(() => expect(result.current.data).toEqual(HELLO));
    expect(getWordDetails).toHaveBeenCalledWith('hello', expect.anything());
  });

  it('não tenta de novo quando a palavra não existe', async () => {
    const getWordDetails = jest.fn().mockRejectedValue(new DictionaryError('not-found'));

    const { result } = await renderUseWordDetails('aalii', getWordDetails);

    await waitFor(() => expect(result.current.error).toMatchObject({ kind: 'not-found' }));
    expect(getWordDetails).toHaveBeenCalledTimes(1);
  });

  it('não faz requisição para palavra vazia', async () => {
    const getWordDetails = jest.fn();

    await renderUseWordDetails('', getWordDetails);

    expect(getWordDetails).not.toHaveBeenCalled();
  });
});

describe('shouldRetryWordDetails', () => {
  it.each([
    [0, 'server', true],
    [1, 'network', true],
    [0, 'timeout', false],
    [2, 'server', false],
    [0, 'not-found', false],
    [0, 'invalid-response', false],
  ] as const)('tentativa %i com erro "%s" → %s', (failureCount, kind, expected) => {
    expect(shouldRetryWordDetails(failureCount, new DictionaryError(kind))).toBe(expected);
  });

  it('não repete erros desconhecidos', () => {
    expect(shouldRetryWordDetails(0, new Error('boom'))).toBe(false);
  });

  it('marca a consulta para ser persistida em disco', async () => {
    const getWordDetails = jest.fn().mockResolvedValue(HELLO);

    const { result, queryClient } = await renderUseWordDetails('hello', getWordDetails);

    await waitFor(() => expect(result.current.data).toEqual(HELLO));

    const query = queryClient.getQueryCache().find({ queryKey: wordDetailsKeys.detail('hello') });
    expect(query?.meta).toEqual({ persist: true });
  });
});
