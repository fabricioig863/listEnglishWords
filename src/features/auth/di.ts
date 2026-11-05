import { createInjectionContext } from '@/shared/di/create-injection-context';

import type { AuthRepository } from './domain/auth-repository';

export const [AuthRepositoryProvider, useAuthRepository] =
  createInjectionContext<AuthRepository>('AuthRepository');
