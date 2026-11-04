import type { Query } from '@tanstack/react-query';

import { shouldPersistQuery } from './query-client';

function fakeQuery(status: Query['state']['status'], meta?: Query['meta']) {
  return { state: { status }, meta } as Query;
}

describe('shouldPersistQuery', () => {
  it('persiste consultas bem-sucedidas que pediram persistência', () => {
    expect(shouldPersistQuery(fakeQuery('success', { persist: true }))).toBe(true);
  });

  it.each([
    ['sem meta', fakeQuery('success')],
    ['com persist false', fakeQuery('success', { persist: false })],
    ['com erro', fakeQuery('error', { persist: true })],
    ['ainda carregando', fakeQuery('pending', { persist: true })],
  ])('não persiste consulta %s', (_, query) => {
    expect(shouldPersistQuery(query)).toBe(false);
  });
});
