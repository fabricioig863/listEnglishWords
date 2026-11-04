import type { PropsWithChildren } from 'react';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Box } from './box';

type ScreenProps = PropsWithChildren<{
  edges?: Edge[];
}>;

export function Screen({ children, edges = ['top'] }: ScreenProps) {
  return (
    <Box flex={1} bg="background">
      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        {children}
      </SafeAreaView>
    </Box>
  );
}
