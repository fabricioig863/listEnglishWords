import type { SupabaseClient, User } from '@supabase/supabase-js';

import { AuthError } from '../domain/auth-error';
import type { AuthRepository } from '../domain/auth-repository';
import type { AuthUser } from '../domain/auth-user';

import { mapAuthError } from './map-auth-error';

export type SupabaseAuth = Pick<
  SupabaseClient['auth'],
  'getSession' | 'signInWithPassword' | 'signUp' | 'signOut' | 'onAuthStateChange'
>;

function toAuthUser(user: User): AuthUser {
  const name = user.user_metadata?.name;

  return {
    id: user.id,
    email: user.email ?? '',
    name: typeof name === 'string' && name.length > 0 ? name : null,
  };
}

export function createSupabaseAuthRepository(auth: SupabaseAuth): AuthRepository {
  return {
    async getCurrentUser() {
      const { data } = await auth.getSession();

      return data.session ? toAuthUser(data.session.user) : null;
    },

    async signIn({ email, password }) {
      const { data, error } = await auth.signInWithPassword({ email, password });

      if (error) {
        throw mapAuthError(error);
      }

      return toAuthUser(data.user);
    },

    async signUp({ name, email, password }) {
      const { data, error } = await auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) {
        throw mapAuthError(error);
      }

      if (!data.user || !data.session) {
        throw new AuthError('unknown');
      }

      return toAuthUser(data.user);
    },

    async signOut() {
      const { error } = await auth.signOut({ scope: 'local' });

      if (error) {
        throw mapAuthError(error);
      }
    },

    onAuthStateChange(listener) {
      const { data } = auth.onAuthStateChange((_event, session) => {
        listener(session ? toAuthUser(session.user) : null);
      });

      return () => data.subscription.unsubscribe();
    },
  };
}
