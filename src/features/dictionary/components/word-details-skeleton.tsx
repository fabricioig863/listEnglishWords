import { Box } from '@/shared/ui/box';
import { Skeleton } from '@/shared/ui/skeleton';
import { Text } from '@/shared/ui/text';

const DEFINITION_LINES = [
  ['100%', '88%', '52%'],
  ['94%', '70%', '44%'],
  ['100%', '82%', '60%'],
] as const;

const HIDDEN_FROM_ACCESSIBILITY = {
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;

export function PhoneticChipsSkeleton() {
  return (
    <Box flexDirection="row" gap="s" {...HIDDEN_FROM_ACCESSIBILITY}>
      <Skeleton width={104} height={32} />
      <Skeleton width={104} height={32} tone="soft" />
    </Box>
  );
}

export function MeaningsSkeleton() {
  return (
    <Box gap="m" testID="meanings-skeleton">
      <Text variant="heading">Significados</Text>

      <Box flexDirection="row" gap="s" {...HIDDEN_FROM_ACCESSIBILITY}>
        <Skeleton width={104} height={44} />
        <Skeleton width={72} height={44} tone="soft" />
        <Skeleton width={64} height={44} tone="soft" />
      </Box>

      <Box gap="xl" marginTop="xs" {...HIDDEN_FROM_ACCESSIBILITY}>
        {DEFINITION_LINES.map((lines, row) => (
          <Box key={row} flexDirection="row" gap="m">
            <Skeleton width={24} height={24} />
            <Box flex={1} gap="s" paddingTop="xs">
              {lines.map((width, index) => (
                <Skeleton
                  key={width + index}
                  width={width}
                  height={12}
                  radius="xs"
                  tone={index === lines.length - 1 ? 'soft' : 'strong'}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
