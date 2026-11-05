import { toFavoriteItem, toHistoryItem } from './supabase-library-repository';

describe('mapeamento das linhas do Supabase', () => {
  it('converte favorito de snake_case para o modelo do app', () => {
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

  it('converte item do histórico', () => {
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
