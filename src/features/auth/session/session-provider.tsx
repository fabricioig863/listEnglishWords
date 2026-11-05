import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { useAuthRepository } from '../di';
import type { AuthUser } from '../domain/auth-user';

export type SessionState =
  { status: 'loading' } | { status: 'signed-out' } | { status: 'signed-in'; user: AuthUser };

const SessionContext = createContext<SessionState | null>(null);

function toSessionState(user: AuthUser | null): SessionState {
  return user ? { status: 'signed-in', user } : { status: 'signed-out' };
}

export function SessionProvider({ children }: PropsWithChildren) {
  const repository = useAuthRepository();
  const [session, setSession] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let isActive = true;

    repository
      .getCurrentUser()
      .then((user) => {
        if (isActive) {
          setSession(toSessionState(user));
        }
      })
      .catch(() => {
        if (isActive) {
          setSession({ status: 'signed-out' });
        }
      });

    const unsubscribe = repository.onAuthStateChange((user) => setSession(toSessionState(user)));

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [repository]);

  return <SessionContext value={session}>{children}</SessionContext>;
}

export function useSession(): SessionState {
  const session = use(SessionContext);

  if (session === null) {
    throw new Error('useSession precisa estar dentro de SessionProvider.');
  }

  return session;
}
