import { useRouter } from 'expo-router';
import { ChevronRight, Heart, History, Trash2, TriangleAlert } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, Alert, Pressable, SectionList } from 'react-native';

import { Box } from '@/shared/ui/box';
import { Icon } from '@/shared/ui/icon';
import { StateMessage } from '@/shared/ui/state-message';
import { Text } from '@/shared/ui/text';

import { formatTime, groupHistoryByDay } from '../domain/group-history-by-day';
import { useFavorites } from '../hooks/use-favorites';
import { useClearHistory, useHistory } from '../hooks/use-history';

export function HistoryScreen() {
  const router = useRouter();
  const { data: history = [], isPending, isError, refetch } = useHistory();
  const { data: favorites = [] } = useFavorites();
  const clearHistory = useClearHistory();

  const sections = useMemo(() => groupHistoryByDay(history), [history]);
  const favoriteWords = useMemo(
    () => new Set(favorites.map((favorite) => favorite.word)),
    [favorites],
  );

  function confirmClear() {
    Alert.alert('Limpar histórico?', 'As palavras vistas serão removidas desta lista.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: () => clearHistory.mutate() },
    ]);
  }

  if (isPending) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator accessibilityLabel="Carregando histórico" />
      </Box>
    );
  }

  if (isError) {
    return (
      <StateMessage
        icon={TriangleAlert}
        title="Não foi possível carregar o histórico"
        primaryAction={{ label: 'Tentar novamente', onPress: () => refetch() }}
      />
    );
  }

  if (history.length === 0) {
    return (
      <StateMessage
        icon={History}
        title="Nenhuma palavra vista ainda"
        description="As palavras que você abrir aparecem aqui."
      />
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(entry) => entry.word}
      contentContainerStyle={{ padding: 20, gap: 8 }}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="labelStrong">Vistas recentemente</Text>
          <Pressable
            onPress={confirmClear}
            accessibilityRole="button"
            accessibilityLabel="Limpar histórico"
            hitSlop={8}
          >
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Icon icon={Trash2} color="textSecondary" size={16} />
              <Text variant="label" color="textSecondary">
                Limpar
              </Text>
            </Box>
          </Pressable>
        </Box>
      }
      renderSectionHeader={({ section }) => (
        <Text variant="overline" marginTop="m">
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/word/[word]', params: { word: item.word } })}
          accessibilityRole="button"
          accessibilityLabel={item.word}
        >
          <Box
            bg="surface"
            borderRadius="l"
            padding="l"
            flexDirection="row"
            alignItems="center"
            gap="m"
          >
            <Box flex={1} gap="xs">
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Text variant="bodyStrong">{item.word}</Text>
                {favoriteWords.has(item.word) ? (
                  <Icon icon={Heart} color="favorite" size={14} filled />
                ) : null}
              </Box>
              <Text variant="caption">
                {item.hasDefinition
                  ? [item.phonetic, item.partOfSpeech].filter(Boolean).join(' · ')
                  : 'Sem definição'}
              </Text>
            </Box>
            <Text variant="caption">{formatTime(new Date(item.viewedAt))}</Text>
            <Icon icon={ChevronRight} color="textSecondary" size={18} />
          </Box>
        </Pressable>
      )}
    />
  );
}
