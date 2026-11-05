import { useTheme } from '@shopify/restyle';
import { CircleAlert, Eye, EyeOff, Info, type LucideIcon } from 'lucide-react-native';
import { ComponentRef, Ref, useState } from 'react';
import { Pressable, TextInput, type TextInputProps } from 'react-native';

import { fonts } from '@/shared/theme/fonts';
import type { Theme } from '@/shared/theme/theme';

import { Box } from './box';
import { Icon } from './icon';
import { Text } from './text';

type TextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export function TextField({
  label,
  icon,
  error,
  hint,
  isPassword = false,
  ref,
  ...inputProps
}: TextFieldProps) {
  const { colors, borderRadii } = useTheme<Theme>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <Box gap="s">
      <Text variant="label">{label}</Text>

      <Box justifyContent="center">
        <Box position="absolute" left={16} zIndex={1} pointerEvents="none">
          <Icon icon={icon} color={hasError ? 'danger' : 'textSecondary'} />
        </Box>

        <TextInput
          {...inputProps}
          ref={ref}
          accessibilityLabel={label}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor={colors.placeholder}
          style={{
            height: 52,
            paddingLeft: 46,
            paddingRight: isPassword ? 52 : 16,
            borderWidth: hasError ? 2 : 1,
            borderColor: hasError ? colors.danger : colors.inputBorder,
            borderRadius: borderRadii.m,
            backgroundColor: hasError ? colors.dangerSoft : colors.surface,
            fontFamily: fonts.regular,
            fontSize: 16,
            color: colors.text,
          }}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            style={{
              position: 'absolute',
              right: 4,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon icon={isPasswordVisible ? EyeOff : Eye} color="textSecondary" />
          </Pressable>
        ) : null}
      </Box>

      {error ? (
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Icon icon={CircleAlert} color="danger" size={16} />
          <Text
            variant="helper"
            color="danger"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        </Box>
      ) : hint ? (
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Icon icon={Info} color="accent" size={16} />
          <Text variant="helper" color="accent">
            {hint}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}
