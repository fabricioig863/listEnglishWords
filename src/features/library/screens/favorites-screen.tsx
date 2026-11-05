import { useRouter } from 'expo-router';
import { Heart, TriangleAlert } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';

import { Box } from '@/shared/ui/box';
import { Icon } from '@/shared/ui/icon';
import { StateMessage } from '@/shared/ui/state-message';
import { Text } from '@/shared/ui/text';

import type { FavoriteItem } from '../domain/library';
import { useFavorites, useToggleFavorite } from '../hooks/use-favorites';

const UNDO_TIMEOUT_MS = 4000;

export function FavoritesScreen() {
  const router = useRouter();
  const { data: favorites = [], isPending, isError, refetch } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const [removed, setRemoved] = useState<FavoriteItem | null>(null);

  useEffect(() => {
    if (!removed) return;

    const timeoutId = setTimeout(() => setRemoved(null), UNDO_TIMEOUT_MS);
    return () => clearTimeout(timeoutId);
  }, [removed]);

  function removeFavorite(favorite: FavoriteItem) {
    toggleFavorite.mutate({ snapshot: favorite, isFavorite: true });
    setRemoved(favorite);
  }

  function undoRemoval() {
    if (removed) {
      toggleFavorite.mutate({ snapshot: removed, isFavorite: false });
      setRemoved(null);
    }
  }

  if (isPending) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator accessibilityLabel="Carregando favoritos" />
      </Box>
    );
  }

  if (isError) {
    return (
      <StateMessage
        icon={TriangleAlert}
        title="Não foi possível carregar seus favoritos"
        primaryAction={{ label: 'Tentar novamente', onPress: () => refetch() }}
      />
    );
  }

  return (
    <Box flex={1}>
      {favorites.length === 0 ? (
        <StateMessage
          icon={Heart}
          title="Nenhum favorito ainda"
          description="Toque no coração de uma palavra para salvá-la aqui."
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(favorite) => favorite.word}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          ListHeaderComponent={
            <Box flexDirection="row" justifyContent="space-between" alignItems="baseline">
              <Text variant="labelStrong">Suas palavras</Text>
              <Text variant="overline">
                {favorites.length === 1 ? '1 salva' : `${favorites.length} salvas`}
              </Text>
            </Box>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/word/[word]', params: { word: item.word } })}
              accessibilityRole="button"
              accessibilityLabel={item.word}
            >
              <Box bg="surface" borderRadius="l" padding="l" flexDirection="row" gap="m">
                <Box flex={1} gap="xs">
                  <Text variant="bodyStrong">{item.word}</Text>
                  {item.phonetic ? <Text variant="phonetic">{item.phonetic}</Text> : null}
                  <Text variant="caption" numberOfLines={2}>
                    {item.hasDefinition
                      ? [item.partOfSpeech, item.firstDefinition].filter(Boolean).join(' · ')
                      : 'Sem definição'}
                  </Text>
                </Box>
                <Pressable
                  onPress={() => removeFavorite(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${item.word} dos favoritos`}
                  hitSlop={8}
                >
                  <Icon icon={Heart} color="favorite" filled />
                </Pressable>
              </Box>
            </Pressable>
          )}
        />
      )}

      {removed ? (
        <Box
          position="absolute"
          left={20}
          right={20}
          bottom={20}
          bg="text"
          borderRadius="m"
          paddingHorizontal="l"
          paddingVertical="m"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          accessibilityLiveRegion="polite"
        >
          <Text variant="label" color="onAccent" flex={1}>
            “{removed.word}” removida dos favoritos
          </Text>
          <Pressable onPress={undoRemoval} accessibilityRole="button" hitSlop={8}>
            <Text variant="labelStrong" color="highlight">
              Desfazer
            </Text>
          </Pressable>
        </Box>
      ) : null}
    </Box>
  );
}
