import { Alert } from 'react-native';

import { useSession } from '../session/session-provider';

import { useSignOut } from './use-sign-out';

export function useAccountMenu() {
  const session = useSession();
  const signOut = useSignOut();

  return function openAccountMenu() {
    if (session.status !== 'signed-in') {
      return;
    }

    const { name, email } = session.user;

    Alert.alert(name ?? 'Sua conta', email, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () =>
          signOut.mutate(undefined, {
            onError: () => Alert.alert('Não foi possível sair', 'Tente novamente.'),
          }),
      },
    ]);
  };
}
