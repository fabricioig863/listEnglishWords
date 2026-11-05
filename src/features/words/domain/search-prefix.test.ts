import { getPrefixUpperBound, isSearchablePrefix, normalizePrefix } from './search-prefix';

describe('normalizePrefix', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizePrefix('  HeL ')).toBe('hel');
  });
});

describe('isSearchablePrefix', () => {
  it.each(['a', 'hel', 'serendipity'])('accepts "%s"', (prefix) => {
    expect(isSearchablePrefix(prefix)).toBe(true);
  });

  it.each(['', 'hel-', "don't", 'café', '42'])('rejects "%s"', (prefix) => {
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

  it.each(['z', 'zz'])('"%s" has no upper bound', (prefix) => {
    expect(getPrefixUpperBound(prefix)).toBeNull();
  });
});
