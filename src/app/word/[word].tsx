import { useLocalSearchParams } from 'expo-router';

import { Box } from '@/shared/ui/box';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export default function WordDetailRoute() {
  const { word } = useLocalSearchParams<{ word: string }>();

  return (
    <Screen>
      <Box padding="screen">
        <Text variant="word">{word}</Text>
      </Box>
    </Screen>
  );
}
