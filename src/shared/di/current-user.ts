import { createInjectionContext } from './create-injection-context';

export type CurrentUser = { userId: string | null };

export const [CurrentUserProvider, useCurrentUser] =
  createInjectionContext<CurrentUser>('CurrentUser');
