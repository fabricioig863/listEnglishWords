import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database, Tables } from '@/shared/lib/database.types';

import type { FavoriteItem, HistoryItem, LibraryRepository } from '../domain/library';

type LibraryClient = Pick<SupabaseClient<Database>, 'from'>;

const HISTORY_LIMIT = 200;

export function toFavoriteItem(row: Tables<'favorites'>): FavoriteItem {
  return {
    word: row.word,
    phonetic: row.phonetic,
    partOfSpeech: row.part_of_speech,
    firstDefinition: row.first_definition,
    hasDefinition: row.has_definition,
    createdAt: row.created_at,
  };
}

export function toHistoryItem(row: Tables<'history'>): HistoryItem {
  return {
    word: row.word,
    phonetic: row.phonetic,
    partOfSpeech: row.part_of_speech,
    hasDefinition: row.has_definition,
    viewedAt: row.viewed_at,
  };
}

export function createSupabaseLibraryRepository(client: LibraryClient): LibraryRepository {
  return {
    async listFavorites() {
      const { data, error } = await client
        .from('favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(toFavoriteItem);
    },

    async addFavorite(snapshot) {
      const { error } = await client.from('favorites').upsert(
        {
          word: snapshot.word,
          phonetic: snapshot.phonetic,
          part_of_speech: snapshot.partOfSpeech,
          first_definition: snapshot.firstDefinition,
          has_definition: snapshot.hasDefinition,
        },
        { onConflict: 'user_id,word', ignoreDuplicates: true },
      );

      if (error) throw error;
    },

    async removeFavorite(word) {
      const { error } = await client.from('favorites').delete().eq('word', word);

      if (error) throw error;
    },

    async listHistory() {
      const { data, error } = await client
        .from('history')
        .select('*')
        .order('viewed_at', { ascending: false })
        .limit(HISTORY_LIMIT);

      if (error) throw error;
      return data.map(toHistoryItem);
    },

    async recordView(snapshot) {
      const { error } = await client.from('history').upsert(
        {
          word: snapshot.word,
          phonetic: snapshot.phonetic,
          part_of_speech: snapshot.partOfSpeech,
          has_definition: snapshot.hasDefinition,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,word' },
      );

      if (error) throw error;
    },

    async clearHistory() {
      const { error } = await client.from('history').delete().neq('word', '');

      if (error) throw error;
    },
  };
}
