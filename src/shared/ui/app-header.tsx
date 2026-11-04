import { UserRound } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Box } from './box';
import { Icon } from './icon';
import { Text } from './text';

type AppHeaderProps = {
  onPressAccount?: () => void;
};

export function AppHeader({ onPressAccount }: AppHeaderProps) {
  return (
    <Box flexDirection="row" alignItems="center" justifyContent="space-between" gap="m">
      <Box gap="xs">
        <Text variant="overline">Inglês → significados</Text>
        <Text variant="title" accessibilityRole="header">
          Dicionário
        </Text>
      </Box>

      <Pressable
        onPress={onPressAccount}
        accessibilityRole="button"
        accessibilityLabel="Conta e sair"
      >
        <Box
          width={44}
          height={44}
          borderRadius="pill"
          borderWidth={1}
          borderColor="border"
          bg="surface"
          alignItems="center"
          justifyContent="center"
        >
          <Icon icon={UserRound} />
        </Box>
      </Pressable>
    </Box>
  );
}
