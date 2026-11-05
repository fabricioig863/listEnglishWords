import { Pressable } from 'react-native';

import { Box } from '@/shared/ui/box';
import { Text } from '@/shared/ui/text';

type WordCellProps = {
  word: string;
  onPress: (word: string) => void;
};

export function WordCell({ word, onPress }: WordCellProps) {
  return (
    <Pressable
      onPress={() => onPress(word)}
      accessibilityRole="button"
      accessibilityLabel={word}
      accessibilityHint="Abre os significados da palavra"
      testID={`word-cell-${word}`}
    >
      {({ pressed }) => (
        <Box
          height={52}
          paddingHorizontal="s"
          borderRadius="s"
          borderWidth={1}
          borderColor={pressed ? 'accent' : 'border'}
          bg={pressed ? 'accentSoft' : 'surface'}
          alignItems="center"
          justifyContent="center"
        >
          <Text variant="label" numberOfLines={1} ellipsizeMode="tail">
            {word}
          </Text>
        </Box>
      )}
    </Pressable>
  );
}
