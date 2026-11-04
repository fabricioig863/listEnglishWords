import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Box } from './box';
import { Icon } from './icon';
import { Text } from './text';

const VARIANTS = {
  primary: { bg: 'accent', pressedBg: 'accentPressed', border: 'accent', text: 'onAccent' },
  secondary: { bg: 'surface', pressedBg: 'background', border: 'inputBorder', text: 'text' },
} as const;

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: keyof typeof VARIANTS;
  icon?: LucideIcon;
};

export function Button({ label, onPress, variant = 'primary', icon }: ButtonProps) {
  const colors = VARIANTS[variant];

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Box
          height={48}
          paddingHorizontal="l"
          borderRadius="m"
          borderWidth={1}
          borderColor={colors.border}
          bg={pressed ? colors.pressedBg : colors.bg}
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap="s"
        >
          <Text variant="bodyStrong" color={colors.text}>
            {label}
          </Text>
          {icon ? <Icon icon={icon} color={colors.text} size={18} /> : null}
        </Box>
      )}
    </Pressable>
  );
}
