import { useState } from 'react';

import { Box } from '@/shared/ui/box';
import { Text } from '@/shared/ui/text';

import type { Meaning } from '../domain/word-details';

import { DefinitionList } from './definition-list';
import { MeaningTabs } from './meaning-tabs';

function formatClassCount(count: number) {
  return count === 1 ? '1 classe' : `${count} classes`;
}

export function MeaningsSection({ meanings }: { meanings: Meaning[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (meanings.length === 0) {
    return (
      <Text variant="body" color="textSecondary">
        O dicionário não trouxe significados para esta palavra.
      </Text>
    );
  }

  const selected = meanings[selectedIndex] ?? meanings[0];

  return (
    <Box gap="m">
      <Box flexDirection="row" alignItems="baseline" justifyContent="space-between">
        <Text variant="heading" accessibilityRole="header">
          Significados
        </Text>
        <Text variant="overline">{formatClassCount(meanings.length)}</Text>
      </Box>

      <MeaningTabs
        partsOfSpeech={meanings.map((meaning) => meaning.partOfSpeech)}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />

      <DefinitionList definitions={selected.definitions} />
    </Box>
  );
}
