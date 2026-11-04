import { useTheme } from '@shopify/restyle';
import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput } from 'react-native';

import { fonts } from '@/shared/theme/fonts';
import type { Theme } from '@/shared/theme/theme';

import { Box } from './box';
import { Icon } from './icon';

type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

export function SearchInput({ value, onChangeText, placeholder }: SearchInputProps) {
  const { colors, borderRadii } = useTheme<Theme>();

  return (
    <Box justifyContent="center">
      <Box position="absolute" left={16} zIndex={1} pointerEvents="none">
        <Icon icon={Search} color="textSecondary" />
      </Box>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        returnKeyType="search"
        style={{
          height: 52,
          paddingLeft: 46,
          paddingRight: 52,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: borderRadii.m,
          backgroundColor: colors.surface,
          fontFamily: fonts.semiBold,
          fontSize: 16,
          color: colors.text,
        }}
      />

      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          style={{
            position: 'absolute',
            right: 4,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon icon={X} color="textSecondary" />
        </Pressable>
      ) : null}
    </Box>
  );
}
