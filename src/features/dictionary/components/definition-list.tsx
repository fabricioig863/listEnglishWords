import { Box } from '@/shared/ui/box';
import { Text } from '@/shared/ui/text';

import type { Definition } from '../domain/word-details';

export function DefinitionList({ definitions }: { definitions: Definition[] }) {
  return (
    <Box gap="l">
      {definitions.map((definition, index) => (
        <Box key={`${index}-${definition.text}`} flexDirection="row" gap="m">
          <Box
            width={24}
            height={24}
            borderRadius="pill"
            bg="accentSoft"
            alignItems="center"
            justifyContent="center"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text variant="counter">{index + 1}</Text>
          </Box>

          <Box flex={1} gap="xs">
            <Text variant="body">{definition.text}</Text>
            {definition.example ? <Text variant="example">“{definition.example}”</Text> : null}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
