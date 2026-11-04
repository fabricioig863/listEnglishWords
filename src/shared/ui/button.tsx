import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Box } from './box';
import { Icon } from './icon';
import { Text } from './text';

const VARIANTS = {
  primary: { bg: 'accent', pressedBg: 'accentPressed', border: 'accent', text: 'onAccent' },
  secondary: { bg: 'surface', pressedBg: 'background', border: 'inputBorder', text: 'text' },
} as const;

const HEIGHTS = { regular: 48, large: 52 } as const;

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof HEIGHTS;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  icon,
  iconPosition = 'right',
  disabled = false,
}: ButtonProps) {
  const colors = VARIANTS[variant];
  const iconElement = icon ? <Icon icon={icon} color={colors.text} size={18} /> : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      {({ pressed }) => (
        <Box
          height={HEIGHTS[size]}
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
          {iconPosition === 'left' ? iconElement : null}
          <Text variant="bodyStrong" color={colors.text}>
            {label}
          </Text>
          {iconPosition === 'right' ? iconElement : null}
        </Box>
      )}
    </Pressable>
  );
}
