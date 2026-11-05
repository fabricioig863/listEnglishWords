import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils/render';

import { AuthError } from '../domain/auth-error';
import type { AuthRepository } from '../domain/auth-repository';

import { SignUpScreen } from './sign-up-screen';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));

function renderScreen(signUp: jest.Mock) {
  const authRepository = { signUp } as unknown as AuthRepository;

  return renderWithProviders(<SignUpScreen />, { dependencies: { authRepository } });
}

async function fillForm(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  await fireEvent.changeText(screen.getByLabelText('Nome'), values.name);
  await fireEvent.changeText(screen.getByLabelText('E-mail'), values.email);
  await fireEvent.changeText(screen.getByLabelText('Senha'), values.password);
  await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), values.confirmPassword);
  await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
}

describe('SignUpScreen', () => {
  it('avisa quando as senhas não conferem e não envia', async () => {
    const signUp = jest.fn();
    await renderScreen(signUp);

    await fillForm({
      name: 'Ana',
      email: 'ana@email.com',
      password: 'secret1',
      confirmPassword: 'secret2',
    });

    expect(await screen.findByText('As senhas não conferem.')).toBeOnTheScreen();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('envia nome e e-mail aparados, sem a confirmação de senha', async () => {
    const signUp = jest.fn().mockResolvedValue({ id: '1', email: 'ana@email.com', name: 'Ana' });
    await renderScreen(signUp);

    await fillForm({
      name: '  Ana ',
      email: ' ana@email.com ',
      password: 'secret1',
      confirmPassword: 'secret1',
    });

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith({
        name: 'Ana',
        email: 'ana@email.com',
        password: 'secret1',
      }),
    );
  });

  it('orienta a entrar quando o e-mail já tem conta', async () => {
    const signUp = jest.fn().mockRejectedValue(new AuthError('email-in-use'));
    await renderScreen(signUp);

    await fillForm({
      name: 'Ana',
      email: 'ana@email.com',
      password: 'secret1',
      confirmPassword: 'secret1',
    });

    expect(
      await screen.findByText('Já existe uma conta com este e-mail. Tente entrar.'),
    ).toBeOnTheScreen();
  });
});
