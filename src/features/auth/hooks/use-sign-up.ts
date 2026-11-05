import { useMutation } from '@tanstack/react-query';

import { useAuthRepository } from '../di';
import type { SignUpParams } from '../domain/auth-repository';

export function useSignUp() {
  const repository = useAuthRepository();

  return useMutation({
    mutationFn: (params: SignUpParams) => repository.signUp(params),
  });
}
