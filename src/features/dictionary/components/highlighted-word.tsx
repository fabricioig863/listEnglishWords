import { Box } from '@/shared/ui/box';
import { Text } from '@/shared/ui/text';

export function HighlightedWord({ word }: { word: string }) {
  return (
    <Box alignSelf="flex-start" maxWidth="100%">
      <Box position="absolute" left={0} right={0} bottom={0} height={16} bg="highlight" />
      <Text
        variant="word"
        accessibilityRole="header"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.4}
      >
        {word}
      </Text>
    </Box>
  );
}
