import { createInjectionContext } from '@/shared/di/create-injection-context';

import type { LibraryRepository } from './domain/library';

export const [LibraryRepositoryProvider, useLibraryRepository] =
  createInjectionContext<LibraryRepository>('LibraryRepository');
