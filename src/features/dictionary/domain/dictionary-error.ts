export type DictionaryErrorKind =
  'not-found' | 'server' | 'network' | 'timeout' | 'invalid-response';

export class DictionaryError extends Error {
  readonly kind: DictionaryErrorKind;

  constructor(kind: DictionaryErrorKind, cause?: unknown) {
    super(`Dictionary request failed: ${kind}`);
    this.name = 'DictionaryError';
    this.kind = kind;
    this.cause = cause;
  }
}

export function isDictionaryError(error: unknown): error is DictionaryError {
  return error instanceof DictionaryError;
}
