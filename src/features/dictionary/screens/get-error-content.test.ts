import { DictionaryError } from '../domain/dictionary-error';

import { getErrorContent } from './get-error-content';

describe('getErrorContent', () => {
  it.each([
    ['not-found', false, true],
    ['server', true, true],
    ['network', true, false],
    ['timeout', true, false],
    ['invalid-response', true, true],
  ] as const)('"%s" → tentar novamente: %s, Wiktionary: %s', (kind, canRetry, showWiktionary) => {
    const content = getErrorContent(new DictionaryError(kind), 'hello');

    expect(content).toMatchObject({ canRetry, showWiktionary });
  });

  it('trata erros desconhecidos como resposta inesperada', () => {
    expect(getErrorContent(new Error('boom'), 'hello').title).toBe(
      'Não foi possível carregar a palavra',
    );
  });

  it('menciona a palavra na mensagem de ausência de definição', () => {
    expect(getErrorContent(new DictionaryError('not-found'), 'helluo').description).toContain(
      '“helluo”',
    );
  });
});
