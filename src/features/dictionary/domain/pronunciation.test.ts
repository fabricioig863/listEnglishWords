import { formatSeconds, pickAudio } from './pronunciation';

describe('pickAudio', () => {
  it('prefers the American accent', () => {
    const audio = pickAudio([
      { url: 'uk.mp3', accent: 'UK' },
      { url: 'us.mp3', accent: 'US' },
    ]);

    expect(audio?.url).toBe('us.mp3');
  });

  it('uses audio without an identified accent as a last resort', () => {
    expect(pickAudio([{ url: 'x.mp3', accent: null }])?.url).toBe('x.mp3');
  });

  it('returns null when there are no audios', () => {
    expect(pickAudio([])).toBeNull();
  });
});

describe('formatSeconds', () => {
  it.each([
    [0, '0:00'],
    [1.6, '0:01'],
    [65, '1:05'],
    [Number.NaN, '0:00'],
  ])('%p → %s', (input, expected) => {
    expect(formatSeconds(input)).toBe(expected);
  });
});
