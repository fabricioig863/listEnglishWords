import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, UserRound } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';

import type { Theme } from '@/shared/theme/theme';
import { Box } from '@/shared/ui/box';
import { Button } from '@/shared/ui/button';
import { FormTextField } from '@/shared/ui/form-text-field';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

import { MIN_PASSWORD_LENGTH, signUpSchema, type SignUpForm } from '../domain/auth-form-schemas';
import { useSignUp } from '../hooks/use-sign-up';

import { getAuthErrorMessage } from './get-auth-error-message';

export function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme<Theme>();
  const signUp = useSignUp();
  const { control, handleSubmit, setFocus } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(({ name, email, password }) =>
    signUp.mutate({ name, email, password }),
  );

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <Box flex={1} paddingHorizontal="xl" paddingTop="s" paddingBottom="l" gap="xl">
            <IconButton
              icon={ArrowLeft}
              accessibilityLabel="Voltar para o login"
              onPress={() => router.back()}
            />

            <Box gap="s">
              <Text variant="display" accessibilityRole="header">
                Criar{' '}
                <Text variant="display" style={{ backgroundColor: colors.highlight }}>
                  conta
                </Text>
              </Text>
              <Text variant="lead">
                Seus favoritos e o histórico de palavras ficam ligados a ela, em qualquer aparelho.
              </Text>
            </Box>

            <Box gap="l">
              <FormTextField
                control={control}
                name="name"
                testID="sign-up-name"
                label="Nome"
                icon={UserRound}
                placeholder="Como podemos te chamar?"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => setFocus('email')}
              />
              <FormTextField
                control={control}
                name="email"
                label="E-mail"
                testID="sign-up-email"
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
                testID="sign-up-password"
                icon={Lock}
                isPassword
                hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres`}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => setFocus('confirmPassword')}
              />
              <FormTextField
                control={control}
                name="confirmPassword"
                label="Confirmar senha"
                testID="sign-up-confirm-password"
                icon={Lock}
                isPassword
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={() => submit()}
              />
            </Box>

            <Box gap="l">
              {signUp.error ? (
                <Text variant="helper" color="danger" accessibilityRole="alert">
                  {getAuthErrorMessage(signUp.error)}
                </Text>
              ) : null}

              <Button
                testID="sign-up-submit"
                label={signUp.isPending ? 'Criando conta…' : 'Criar conta'}
                size="large"
                onPress={submit}
                disabled={signUp.isPending}
              />

              <Box flexDirection="row" justifyContent="center" gap="xs">
                <Text variant="body" color="textSecondary">
                  Já tem conta?
                </Text>
                <Pressable onPress={() => router.back()} accessibilityRole="link">
                  <Text variant="bodyStrong" color="accent">
                    Entrar
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
