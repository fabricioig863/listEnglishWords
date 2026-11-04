const VALID_PREFIX = /^[a-z]+$/;

export function normalizePrefix(term: string): string {
  return term.trim().toLowerCase();
}

export function isSearchablePrefix(prefix: string): boolean {
  return VALID_PREFIX.test(prefix);
}

/**
 * Menor string que é maior que todas as palavras iniciadas por `prefix`.
 * "hel" → "hem" · "az" → "b" · "zz" → null (sem limite superior)
 */
export function getPrefixUpperBound(prefix: string): string | null {
  const trimmed = prefix.replace(/z+$/, '');

  if (trimmed.length === 0) {
    return null;
  }

  const lastChar = trimmed.charCodeAt(trimmed.length - 1);

  return trimmed.slice(0, -1) + String.fromCharCode(lastChar + 1);
}
