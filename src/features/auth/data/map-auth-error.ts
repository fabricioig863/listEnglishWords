import { isAuthRetryableFetchError } from '@supabase/supabase-js';

import { AuthError, type AuthErrorKind } from '../domain/auth-error';

const KIND_BY_SUPABASE_CODE: Record<string, AuthErrorKind> = {
  invalid_credentials: 'invalid-credentials',
  user_already_exists: 'email-in-use',
  email_exists: 'email-in-use',
  email_address_invalid: 'invalid-email',
  validation_failed: 'invalid-email',
  weak_password: 'weak-password',
};

export function mapAuthError(error: unknown): AuthError {
  if (isAuthRetryableFetchError(error)) {
    return new AuthError('network', error);
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : undefined;

  return new AuthError((code && KIND_BY_SUPABASE_CODE[code]) || 'unknown', error);
}
