import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';
import { BookOpen, Lock, Mail } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';

import type { Theme } from '@/shared/theme/theme';
import { Box } from '@/shared/ui/box';
import { Button } from '@/shared/ui/button';
import { FormTextField } from '@/shared/ui/form-text-field';
import { Icon } from '@/shared/ui/icon';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

import { signInSchema, type SignInForm } from '../domain/auth-form-schemas';
import { useSignIn } from '../hooks/use-sign-in';

import { getAuthErrorMessage } from './get-auth-error-message';

export function SignInScreen() {
  const { colors } = useTheme<Theme>();
  const router = useRouter();
  const signIn = useSignIn();
  const { control, handleSubmit, setFocus } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit((values) => signIn.mutate(values));

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <Box flex={1} paddingHorizontal="xl" paddingTop="xxl" paddingBottom="l" gap="xl">
            <Box gap="l">
              <Box
                width={56}
                height={56}
                borderRadius="l"
                bg="accent"
                alignItems="center"
                justifyContent="center"
              >
                <Icon icon={BookOpen} color="onAccent" size={28} />
              </Box>
              <Box gap="s">
                <Text variant="display" accessibilityRole="header">
                  Dicionário
                </Text>
                <Text variant="lead">
                  Aprenda inglês{' '}
                  <Text
                    variant="lead"
                    color="text"
                    fontFamily="PlusJakartaSans_600SemiBold"
                    style={{ backgroundColor: colors.highlight }}
                  >
                    palavra por palavra
                  </Text>
                  . Seus favoritos e histórico ficam salvos na sua conta.
                </Text>
              </Box>
            </Box>

            <Box flex={1} justifyContent="flex-end" gap="l">
              <FormTextField
                control={control}
                name="email"
                label="E-mail"
                icon={Mail}
                placeholder="voce@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => setFocus('password')}
              />
              <FormTextField
                control={control}
                name="password"
                label="Senha"
                icon={Lock}
                isPassword
                placeholder="Sua senha"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={() => submit()}
              />

              {signIn.error ? (
                <Text variant="helper" color="danger" accessibilityRole="alert">
                  {getAuthErrorMessage(signIn.error)}
                </Text>
              ) : null}

              <Button
                label={signIn.isPending ? 'Entrando…' : 'Entrar'}
                size="large"
                onPress={submit}
                disabled={signIn.isPending}
              />

              <Box flexDirection="row" justifyContent="center" gap="xs">
                <Text variant="body" color="textSecondary">
                  Não tem conta?
                </Text>
                <Pressable onPress={() => router.push('/sign-up')} accessibilityRole="link">
                  <Text variant="bodyStrong" color="accent">
                    Criar conta
                  </Text>
                </Pressable>
              </Box>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
