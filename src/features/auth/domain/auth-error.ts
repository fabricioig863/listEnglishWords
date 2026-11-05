export type AuthErrorKind =
  | 'invalid-credentials'
  | 'email-in-use'
  | 'invalid-email'
  | 'weak-password'
  | 'network'
  | 'unknown';

export class AuthError extends Error {
  readonly kind: AuthErrorKind;

  constructor(kind: AuthErrorKind, cause?: unknown) {
    super(`Authentication failed: ${kind}`);
    this.name = 'AuthError';
    this.kind = kind;
    this.cause = cause;
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
