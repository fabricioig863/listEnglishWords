import { useMutation } from '@tanstack/react-query';

import { useAuthRepository } from '../di';

export function useSignOut() {
  const repository = useAuthRepository();

  return useMutation({
    mutationFn: () => repository.signOut(),
  });
}
