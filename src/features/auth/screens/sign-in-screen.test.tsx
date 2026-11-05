import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils/render';

import { AuthError } from '../domain/auth-error';
import type { AuthRepository } from '../domain/auth-repository';

import { SignInScreen } from './sign-in-screen';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

function renderScreen(signIn: jest.Mock) {
  const authRepository = { signIn } as unknown as AuthRepository;

  return renderWithProviders(<SignInScreen />, { dependencies: { authRepository } });
}

async function fillAndSubmit(email: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText('E-mail'), email);
  await fireEvent.changeText(screen.getByLabelText('Senha'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
}

describe('SignInScreen', () => {
  it('valida os campos sem chamar o servidor', async () => {
    const signIn = jest.fn();
    await renderScreen(signIn);

    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe seu e-mail.')).toBeOnTheScreen();
    expect(screen.getByText('Informe sua senha.')).toBeOnTheScreen();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('envia o e-mail aparado e a senha', async () => {
    const signIn = jest.fn().mockResolvedValue({ id: '1', email: 'ana@email.com', name: 'Ana' });
    await renderScreen(signIn);

    await fillAndSubmit('  ana@email.com ', 'secret1');

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith({ email: 'ana@email.com', password: 'secret1' }),
    );
  });

  it('mostra a mensagem do servidor quando as credenciais estão erradas', async () => {
    const signIn = jest.fn().mockRejectedValue(new AuthError('invalid-credentials'));
    await renderScreen(signIn);

    await fillAndSubmit('ana@email.com', 'wrong1');

    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeOnTheScreen();
  });
});
