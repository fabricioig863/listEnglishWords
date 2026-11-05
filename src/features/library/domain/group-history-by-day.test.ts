import { formatTime, groupHistoryByDay } from './group-history-by-day';
import type { HistoryItem } from './library';

const NOW = new Date(2026, 10, 5, 12, 0);

function item(word: string, date: Date): HistoryItem {
  return {
    word,
    phonetic: null,
    partOfSpeech: null,
    hasDefinition: true,
    viewedAt: date.toISOString(),
  };
}

describe('groupHistoryByDay', () => {
  it('groups into Hoje, Ontem and date, preserving order', () => {
    const sections = groupHistoryByDay(
      [
        item('helluo', new Date(2026, 10, 5, 10, 43)),
        item('hello', new Date(2026, 10, 5, 9, 15)),
        item('ephemeral', new Date(2026, 10, 4, 21, 14)),
        item('serendipity', new Date(2026, 10, 1, 8, 0)),
      ],
      NOW,
    );

    expect(sections.map((section) => section.title)).toEqual(['Hoje', 'Ontem', '01/11/2026']);
    expect(sections[0].data.map((entry) => entry.word)).toEqual(['helluo', 'hello']);
  });

  it('formats the time with two digits', () => {
    expect(formatTime(new Date(2026, 10, 5, 9, 5))).toBe('09:05');
  });
});
