import { useTheme } from '@shopify/restyle';
import { Pressable, ScrollView } from 'react-native';

import type { Theme } from '@/shared/theme/theme';
import { Box } from '@/shared/ui/box';
import { Text } from '@/shared/ui/text';

type MeaningTabsProps = {
  partsOfSpeech: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function MeaningTabs({ partsOfSpeech, selectedIndex, onSelect }: MeaningTabsProps) {
  const { spacing } = useTheme<Theme>();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerStyle={{ gap: spacing.s }}
    >
      {partsOfSpeech.map((partOfSpeech, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Pressable
            key={partOfSpeech}
            onPress={() => onSelect(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
          >
            <Box
              height={44}
              paddingHorizontal="l"
              borderRadius="pill"
              borderWidth={1}
              borderColor={isSelected ? 'accent' : 'border'}
              bg={isSelected ? 'accent' : 'surface'}
              justifyContent="center"
            >
              <Text variant="label" color={isSelected ? 'onAccent' : 'text'}>
                {partOfSpeech}
              </Text>
            </Box>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
