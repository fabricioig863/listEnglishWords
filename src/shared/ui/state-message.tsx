import type { LucideIcon } from 'lucide-react-native';

import { Box } from './box';
import { Button } from './button';
import { Icon } from './icon';
import { Text } from './text';

type StateMessageProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateMessage({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: StateMessageProps) {
  return (
    <Box flex={1} alignItems="center" justifyContent="center" padding="xl" gap="m">
      <Icon icon={icon} color="textSecondary" size={32} />
      <Text variant="bodyStrong" textAlign="center">
        {title}
      </Text>
      {description ? (
        <Text variant="caption" textAlign="center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </Box>
  );
}
