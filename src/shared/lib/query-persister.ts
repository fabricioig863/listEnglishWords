import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import Storage from 'expo-sqlite/kv-store';

export const queryPersister = createAsyncStoragePersister({
  storage: Storage,
  key: 'query-cache',
});

export const QUERY_CACHE_VERSION = 'v1';
