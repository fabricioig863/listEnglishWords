import { QueryClient, type Query } from '@tanstack/react-query';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const QUERY_CACHE_MAX_AGE = ONE_WEEK_MS;

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      persist?: boolean;
    };
  }
}

export function shouldPersistQuery(query: Query): boolean {
  return query.state.status === 'success' && query.meta?.persist === true;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: QUERY_CACHE_MAX_AGE,
      },
    },
  });
}
