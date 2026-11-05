import { act, screen } from '@testing-library/react-native';

import { Text } from '@/shared/ui/text';
import { renderWithProviders } from '@/test-utils/render';

import type { AuthRepository } from '../domain/auth-repository';
import type { AuthUser } from '../domain/auth-user';

import { SessionProvider, useSession } from './session-provider';

const ANA: AuthUser = { id: 'user-1', email: 'ana@email.com', name: 'Ana' };

function SessionStatus() {
  const session = useSession();

  return (
    <Text>{session.status === 'signed-in' ? `logado: ${session.user.name}` : session.status}</Text>
  );
}

function createFakeRepository(currentUser: AuthUser | null) {
  let emit: (user: AuthUser | null) => void = () => {};
  const unsubscribe = jest.fn();

  const repository: AuthRepository = {
    getCurrentUser: jest.fn().mockResolvedValue(currentUser),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn((listener) => {
      emit = listener;
      return unsubscribe;
    }),
  };

  return { repository, unsubscribe, emit: (user: AuthUser | null) => emit(user) };
}

function renderSession(repository: AuthRepository) {
  return renderWithProviders(
    <SessionProvider>
      <SessionStatus />
    </SessionProvider>,
    { dependencies: { authRepository: repository } },
  );
}

describe('SessionProvider', () => {
  it('restores the session stored on the device', async () => {
    const { repository } = createFakeRepository(ANA);

    await renderSession(repository);

    expect(await screen.findByText('logado: Ana')).toBeOnTheScreen();
  });

  it('reports signed out when there is no session', async () => {
    const { repository } = createFakeRepository(null);

    await renderSession(repository);

    expect(await screen.findByText('signed-out')).toBeOnTheScreen();
  });

  it('reacts to sign-in and sign-out', async () => {
    const { repository, emit } = createFakeRepository(null);
    await renderSession(repository);
    await screen.findByText('signed-out');

    await act(async () => emit(ANA));
    expect(screen.getByText('logado: Ana')).toBeOnTheScreen();

    await act(async () => emit(null));
    expect(screen.getByText('signed-out')).toBeOnTheScreen();
  });

  it('unsubscribes on unmount', async () => {
    const { repository, unsubscribe } = createFakeRepository(null);

    const { unmount } = await renderSession(repository);
    await unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
