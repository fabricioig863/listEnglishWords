import type { PropsWithChildren } from 'react';

import { Box } from './box';

export function Card({ children }: PropsWithChildren) {
  return (
    <Box
      bg="surface"
      borderRadius="xl"
      padding="xl"
      gap="m"
      shadowColor="text"
      shadowOpacity={0.05}
      shadowOffset={{ width: 0, height: 1 }}
      shadowRadius={2}
      elevation={1}
    >
      {children}
    </Box>
  );
}
