import { createInjectionContext } from '@/shared/di/create-injection-context';

import type { DictionaryRepository } from './domain/dictionary-repository';

export const [DictionaryRepositoryProvider, useDictionaryRepository] =
  createInjectionContext<DictionaryRepository>('DictionaryRepository');
