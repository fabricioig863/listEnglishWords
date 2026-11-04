import type { ComponentRef, Ref } from 'react';
import { Pressable, type View } from 'react-native';

import { Box } from './box';
import { Text } from './text';

type SegmentedTabProps = {
  label: string;
  isFocused?: boolean;
  onPress?: () => void;
  ref?: Ref<ComponentRef<typeof View>>;
};

export function SegmentedTab({ label, isFocused = false, onPress, ref }: SegmentedTabProps) {
  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={{ flex: 1 }}
    >
      <Box
        height={44}
        borderRadius="s"
        alignItems="center"
        justifyContent="center"
        bg={isFocused ? 'surface' : 'segmentedBackground'}
        shadowColor="text"
        shadowOpacity={isFocused ? 0.1 : 0}
        shadowOffset={{ width: 0, height: 1 }}
        shadowRadius={2}
        elevation={isFocused ? 1 : 0}
      >
        <Text variant="label" color={isFocused ? 'text' : 'textSecondary'}>
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
