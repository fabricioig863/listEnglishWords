import { useTheme } from '@shopify/restyle';
import type { LucideIcon } from 'lucide-react-native';

import type { Theme } from '@/shared/theme/theme';

type IconProps = {
  icon: LucideIcon;
  color?: keyof Theme['colors'];
  size?: number;
  strokeWidth?: number;
};

export function Icon({
  icon: IconComponent,
  color = 'text',
  size = 20,
  strokeWidth = 2,
}: IconProps) {
  const { colors } = useTheme<Theme>();

  return <IconComponent color={colors[color]} size={size} strokeWidth={strokeWidth} />;
}
