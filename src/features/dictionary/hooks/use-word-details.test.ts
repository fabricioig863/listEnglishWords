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
  it('loads details forwarding the cancellation signal', async () => {
    const getWordDetails = jest.fn().mockResolvedValue(HELLO);

    const { result } = await renderUseWordDetails('hello', getWordDetails);

    await waitFor(() => expect(result.current.data).toEqual(HELLO));
    expect(getWordDetails).toHaveBeenCalledWith('hello', expect.anything());
  });

  it('does not retry when the word does not exist', async () => {
    const getWordDetails = jest.fn().mockRejectedValue(new DictionaryError('not-found'));

    const { result } = await renderUseWordDetails('aalii', getWordDetails);

    await waitFor(() => expect(result.current.error).toMatchObject({ kind: 'not-found' }));
    expect(getWordDetails).toHaveBeenCalledTimes(1);
  });

  it('does not request an empty word', async () => {
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
  ] as const)('attempt %i with "%s" error → %s', (failureCount, kind, expected) => {
    expect(shouldRetryWordDetails(failureCount, new DictionaryError(kind))).toBe(expected);
  });

  it('does not retry unknown errors', () => {
    expect(shouldRetryWordDetails(0, new Error('boom'))).toBe(false);
  });

  it('marks the query to be persisted to disk', async () => {
    const getWordDetails = jest.fn().mockResolvedValue(HELLO);

    const { result, queryClient } = await renderUseWordDetails('hello', getWordDetails);

    await waitFor(() => expect(result.current.data).toEqual(HELLO));

    const query = queryClient.getQueryCache().find({ queryKey: wordDetailsKeys.detail('hello') });
    expect(query?.meta).toEqual({ persist: true });
  });
});
