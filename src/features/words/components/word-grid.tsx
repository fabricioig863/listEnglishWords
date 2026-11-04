import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@shopify/restyle';
import { ActivityIndicator } from 'react-native';

import type { Theme } from '@/shared/theme/theme';
import { Box } from '@/shared/ui/box';
import { Text } from '@/shared/ui/text';

import { WordCell } from './word-cell';

const COLUMNS = 3;

type WordGridProps = {
  words: string[];
  isFetchingNextPage: boolean;
  onEndReached: () => void;
  onPressWord: (word: string) => void;
};

export function WordGrid({ words, isFetchingNextPage, onEndReached, onPressWord }: WordGridProps) {
  const { spacing, colors } = useTheme<Theme>();

  return (
    <FlashList
      data={words}
      numColumns={COLUMNS}
      keyExtractor={(word) => word}
      renderItem={({ item }) => (
        <Box padding="xs">
          <WordCell word={item} onPress={onPressWord} />
        </Box>
      )}
      contentContainerStyle={{
        paddingHorizontal: spacing.screen - spacing.xs,
        paddingBottom: spacing.xl,
      }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Box height={44} flexDirection="row" alignItems="center" justifyContent="center" gap="s">
            <ActivityIndicator color={colors.accent} />
            <Text variant="caption">Carregando mais palavras…</Text>
          </Box>
        ) : null
      }
    />
  );
}
