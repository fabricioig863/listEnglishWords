import { createHttpDictionaryRepository } from './http-dictionary-repository';

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function htmlResponse(status: number) {
  return {
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token <');
    },
  } as unknown as Response;
}

const VALID_BODY = [
  {
    word: 'hello',
    phonetics: [{ text: '/həˈləʊ/' }],
    meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'A greeting.' }] }],
  },
];

describe('HttpDictionaryRepository', () => {
  it('busca a palavra e devolve o modelo mapeado', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(200, VALID_BODY));
    const repository = createHttpDictionaryRepository(fetchFn);

    const details = await repository.getWordDetails('hello');

    expect(details.word).toBe('hello');
    expect(fetchFn).toHaveBeenCalledWith(
      'https://api.dictionaryapi.dev/api/v2/entries/en/hello',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    );
  });

  it.each([
    ['not-found', jsonResponse(404, { title: 'No Definitions Found' })],
    ['server', htmlResponse(502)],
    ['invalid-response', jsonResponse(200, { unexpected: true })],
  ])('classifica a resposta como "%s"', async (kind, response) => {
    const repository = createHttpDictionaryRepository(jest.fn().mockResolvedValue(response));

    await expect(repository.getWordDetails('word')).rejects.toMatchObject({ kind });
  });

  it('classifica corpo que não é JSON como "invalid-response"', async () => {
    const response = { ...htmlResponse(200), ok: true, status: 200 } as Response;
    const repository = createHttpDictionaryRepository(jest.fn().mockResolvedValue(response));

    await expect(repository.getWordDetails('word')).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it('classifica falha de conexão como "network"', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const repository = createHttpDictionaryRepository(fetchFn);

    await expect(repository.getWordDetails('word')).rejects.toMatchObject({ kind: 'network' });
  });

  describe('timeout e cancelamento', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    function hangingFetch() {
      return jest.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_, reject) => {
            init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
          }),
      );
    }

    it('aborta e classifica como "timeout" quando a API não responde', async () => {
      const repository = createHttpDictionaryRepository(hangingFetch(), 10_000);

      const request = repository.getWordDetails('word');
      jest.advanceTimersByTime(10_000);

      await expect(request).rejects.toMatchObject({ kind: 'timeout' });
    });

    it('propaga o cancelamento sem convertê-lo em erro de domínio', async () => {
      const repository = createHttpDictionaryRepository(hangingFetch());
      const caller = new AbortController();

      const request = repository.getWordDetails('word', caller.signal);
      caller.abort();

      await expect(request).rejects.toThrow('Aborted');
      await expect(request).rejects.not.toHaveProperty('kind');
    });
  });
});
