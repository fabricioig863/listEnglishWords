import { createInjectionContext } from '@/shared/di/create-injection-context';

import type { WordsRepository } from './domain/words-repository';

export const [WordsRepositoryProvider, useWordsRepository] =
  createInjectionContext<WordsRepository>('WordsRepository');
