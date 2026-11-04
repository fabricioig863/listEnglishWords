import { useTheme } from '@shopify/restyle';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Theme } from '@/shared/theme/theme';
import { Box } from '@/shared/ui/box';
import { Button } from '@/shared/ui/button';

type WordNavigationFooterProps = {
  onBack: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
};

export function WordNavigationFooter({
  onBack,
  onNext,
  isNextDisabled,
}: WordNavigationFooterProps) {
  const insets = useSafeAreaInsets();
  const { spacing } = useTheme<Theme>();

  return (
    <Box
      flexDirection="row"
      gap="m"
      bg="surface"
      borderTopWidth={1}
      borderTopColor="border"
      paddingHorizontal="screen"
      paddingTop="m"
      style={{ paddingBottom: Math.max(insets.bottom, spacing.m) }}
    >
      <Box flex={1}>
        <Button
          label="Voltar"
          variant="secondary"
          size="large"
          icon={ArrowLeft}
          iconPosition="left"
          onPress={onBack}
        />
      </Box>
      <Box flex={1}>
        <Button
          label="Próximo"
          size="large"
          icon={ArrowRight}
          onPress={onNext}
          disabled={isNextDisabled}
        />
      </Box>
    </Box>
  );
}
