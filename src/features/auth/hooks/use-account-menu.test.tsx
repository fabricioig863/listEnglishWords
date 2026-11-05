import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { renderWithProviders } from '@/test-utils/render';

import type { AuthRepository } from '../domain/auth-repository';
import { SessionProvider, useSession } from '../session/session-provider';

import { useAccountMenu } from './use-account-menu';

function AccountMenuHarness() {
  const session = useSession();
  const openAccountMenu = useAccountMenu();

  return (
    <>
      <Text>{session.status}</Text>
      <Button label="Conta" onPress={openAccountMenu} />
    </>
  );
}

function createRepository() {
  return {
    getCurrentUser: jest.fn().mockResolvedValue({ id: '1', email: 'ana@email.com', name: 'Ana' }),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn().mockResolvedValue(undefined),
    onAuthStateChange: jest.fn(() => jest.fn()),
  } satisfies AuthRepository;
}

describe('useAccountMenu', () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  afterEach(() => alertSpy.mockClear());

  async function openMenu(repository: AuthRepository) {
    await renderWithProviders(
      <SessionProvider>
        <AccountMenuHarness />
      </SessionProvider>,
      { dependencies: { authRepository: repository } },
    );
    await screen.findByText('signed-in');
    await fireEvent.press(screen.getByRole('button', { name: 'Conta' }));
  }

  it('mostra o nome e o e-mail do usuário', async () => {
    await openMenu(createRepository());

    expect(alertSpy).toHaveBeenCalledWith('Ana', 'ana@email.com', expect.any(Array));
  });

  it('sai da conta ao confirmar', async () => {
    const repository = createRepository();
    await openMenu(repository);

    const buttons = alertSpy.mock.calls[0][2] as AlertButton[];
    const signOutButton = buttons.find((button) => button.text === 'Sair');

    await act(async () => signOutButton?.onPress?.());

    await waitFor(() => expect(repository.signOut).toHaveBeenCalledTimes(1));
  });
});
