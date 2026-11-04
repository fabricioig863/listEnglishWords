import { DictionaryError } from '../domain/dictionary-error';
import type { DictionaryRepository } from '../domain/dictionary-repository';

import { dictionaryResponseSchema } from './dictionary-api-schema';
import { mapWordDetails } from './map-word-details';

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const DEFAULT_TIMEOUT_MS = 10_000;

type FetchFn = (url: string, init: RequestInit) => Promise<Response>;

export function createHttpDictionaryRepository(
  fetchFn: FetchFn = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): DictionaryRepository {
  return {
    async getWordDetails(word, signal) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const abortFromCaller = () => controller.abort();
      signal?.addEventListener('abort', abortFromCaller);

      let response: Response;

      try {
        response = await fetchFn(`${BASE_URL}${encodeURIComponent(word)}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
      } catch (error) {
        if (signal?.aborted) {
          throw error;
        }
        throw new DictionaryError(controller.signal.aborted ? 'timeout' : 'network', error);
      } finally {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', abortFromCaller);
      }

      if (response.status === 404) {
        throw new DictionaryError('not-found');
      }

      if (!response.ok) {
        throw new DictionaryError('server', response.status);
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch (error) {
        throw new DictionaryError('invalid-response', error);
      }

      const parsed = dictionaryResponseSchema.safeParse(body);
      if (!parsed.success) {
        throw new DictionaryError('invalid-response', parsed.error);
      }

      return mapWordDetails(parsed.data);
    },
  };
}
