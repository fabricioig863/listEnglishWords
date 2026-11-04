import { Pressable } from 'react-native';

import { Box } from './box';
import { Text } from './text';

type ButtonProps = {
  label: string;
  onPress: () => void;
};

export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Box
          height={48}
          paddingHorizontal="xl"
          borderRadius="m"
          bg={pressed ? 'accentPressed' : 'accent'}
          alignItems="center"
          justifyContent="center"
        >
          <Text variant="bodyStrong" color="onAccent">
            {label}
          </Text>
        </Box>
      )}
    </Pressable>
  );
}
