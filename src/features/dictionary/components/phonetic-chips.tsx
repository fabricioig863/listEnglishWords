import { Box } from '@/shared/ui/box';
import { Text } from '@/shared/ui/text';

import type { PhoneticText } from '../domain/word-details';

export function PhoneticChips({ phonetics }: { phonetics: PhoneticText[] }) {
  if (phonetics.length === 0) {
    return (
      <Box
        alignSelf="flex-start"
        height={28}
        paddingHorizontal="m"
        borderRadius="pill"
        bg="background"
        justifyContent="center"
      >
        <Text variant="caption">Sem fonética</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="row" flexWrap="wrap" gap="s">
      {phonetics.map((phonetic) => (
        <Box
          key={phonetic.text}
          height={32}
          paddingLeft={phonetic.accent ? 'xs' : 'm'}
          paddingRight="m"
          borderRadius="pill"
          bg="background"
          flexDirection="row"
          alignItems="center"
          gap="s"
        >
          {phonetic.accent ? (
            <Box
              height={24}
              paddingHorizontal="s"
              borderRadius="pill"
              bg="accentSoft"
              justifyContent="center"
            >
              <Text variant="badge">{phonetic.accent}</Text>
            </Box>
          ) : null}
          <Text variant="phonetic" color="text">
            {phonetic.text}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
