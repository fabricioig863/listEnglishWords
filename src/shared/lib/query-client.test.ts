import type { Query } from '@tanstack/react-query';

import { shouldPersistQuery } from './query-client';

function fakeQuery(status: Query['state']['status'], meta?: Query['meta']) {
  return { state: { status }, meta } as Query;
}

describe('shouldPersistQuery', () => {
  it('persists successful queries that opted in', () => {
    expect(shouldPersistQuery(fakeQuery('success', { persist: true }))).toBe(true);
  });

  it.each([
    ['without meta', fakeQuery('success')],
    ['with persist false', fakeQuery('success', { persist: false })],
    ['with an error', fakeQuery('error', { persist: true })],
    ['still loading', fakeQuery('pending', { persist: true })],
  ])('does not persist a query %s', (_, query) => {
    expect(shouldPersistQuery(query)).toBe(false);
  });
});
