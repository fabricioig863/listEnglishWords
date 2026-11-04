import type { LucideIcon } from 'lucide-react-native';

import { Box } from './box';
import { Button, type ButtonProps } from './button';
import { Icon } from './icon';
import { Text } from './text';

type StateAction = Pick<ButtonProps, 'label' | 'onPress' | 'icon'>;

type StateMessageProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  primaryAction?: StateAction;
  secondaryAction?: StateAction;
};

export function StateMessage({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: StateMessageProps) {
  return (
    <Box flex={1} alignItems="center" justifyContent="center" padding="xl" gap="m">
      <Box
        width={72}
        height={72}
        borderRadius="pill"
        bg="accentSoft"
        alignItems="center"
        justifyContent="center"
      >
        <Icon icon={icon} color="accent" size={32} />
      </Box>
      <Text variant="heading" textAlign="center">
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="textSecondary" textAlign="center" maxWidth={300}>
          {description}
        </Text>
      ) : null}
      {primaryAction ? <Button {...primaryAction} /> : null}
      {secondaryAction ? <Button {...secondaryAction} variant="secondary" /> : null}
    </Box>
  );
}
