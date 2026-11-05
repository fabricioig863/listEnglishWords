import { useMutation } from '@tanstack/react-query';

import { useAuthRepository } from '../di';
import type { SignInParams } from '../domain/auth-repository';

export function useSignIn() {
  const repository = useAuthRepository();

  return useMutation({
    mutationFn: (params: SignInParams) => repository.signIn(params),
  });
}
