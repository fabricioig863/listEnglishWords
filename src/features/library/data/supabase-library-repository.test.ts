import { toFavoriteItem, toHistoryItem } from './supabase-library-repository';

describe('Supabase row mapping', () => {
  it('maps a favorite row from snake_case to the app model', () => {
    expect(
      toFavoriteItem({
        user_id: 'user-1',
        word: 'hello',
        phonetic: '/həˈləʊ/',
        part_of_speech: 'noun',
        first_definition: 'A greeting.',
        has_definition: true,
        created_at: '2026-11-05T10:00:00Z',
      }),
    ).toEqual({
      word: 'hello',
      phonetic: '/həˈləʊ/',
      partOfSpeech: 'noun',
      firstDefinition: 'A greeting.',
      hasDefinition: true,
      createdAt: '2026-11-05T10:00:00Z',
    });
  });

  it('maps a history row', () => {
    expect(
      toHistoryItem({
        user_id: 'user-1',
        word: 'aalii',
        phonetic: null,
        part_of_speech: null,
        has_definition: false,
        viewed_at: '2026-11-05T10:00:00Z',
      }),
    ).toEqual({
      word: 'aalii',
      phonetic: null,
      partOfSpeech: null,
      hasDefinition: false,
      viewedAt: '2026-11-05T10:00:00Z',
    });
  });
});
