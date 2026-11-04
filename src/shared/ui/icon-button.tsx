import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import type { Theme } from '@/shared/theme/theme';

import { Box } from './box';
import { Icon } from './icon';

type IconButtonProps = {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  color?: keyof Theme['colors'];
};

export function IconButton({ icon, accessibilityLabel, onPress, color = 'text' }: IconButtonProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      {({ pressed }) => (
        <Box
          width={44}
          height={44}
          borderRadius="pill"
          borderWidth={1}
          borderColor="border"
          bg={pressed ? 'background' : 'surface'}
          alignItems="center"
          justifyContent="center"
        >
          <Icon icon={icon} color={color} />
        </Box>
      )}
    </Pressable>
  );
}
