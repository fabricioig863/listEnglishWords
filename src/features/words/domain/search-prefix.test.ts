import { getPrefixUpperBound, isSearchablePrefix, normalizePrefix } from './search-prefix';

describe('normalizePrefix', () => {
  it('remove espaços e converte para minúsculas', () => {
    expect(normalizePrefix('  HeL ')).toBe('hel');
  });
});

describe('isSearchablePrefix', () => {
  it.each(['a', 'hel', 'serendipity'])('aceita "%s"', (prefix) => {
    expect(isSearchablePrefix(prefix)).toBe(true);
  });

  it.each(['', 'hel-', "don't", 'café', '42'])('rejeita "%s"', (prefix) => {
    expect(isSearchablePrefix(prefix)).toBe(false);
  });
});

describe('getPrefixUpperBound', () => {
  it.each([
    ['a', 'b'],
    ['hel', 'hem'],
    ['az', 'b'],
    ['hez', 'hf'],
    ['azz', 'b'],
  ])('"%s" → "%s"', (prefix, expected) => {
    expect(getPrefixUpperBound(prefix)).toBe(expected);
  });

  it.each(['z', 'zz'])('"%s" não tem limite superior', (prefix) => {
    expect(getPrefixUpperBound(prefix)).toBeNull();
  });
});
