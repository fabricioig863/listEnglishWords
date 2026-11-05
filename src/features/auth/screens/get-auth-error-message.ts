import { isAuthError, type AuthErrorKind } from '../domain/auth-error';

export function getAuthErrorMessage(error: unknown): string {
  const kind: AuthErrorKind = isAuthError(error) ? error.kind : 'unknown';

  switch (kind) {
    case 'invalid-credentials':
      return 'E-mail ou senha incorretos.';
    case 'email-in-use':
      return 'Já existe uma conta com este e-mail. Tente entrar.';
    case 'invalid-email':
      return 'Este e-mail não foi aceito. Verifique e tente novamente.';
    case 'weak-password':
      return 'Escolha uma senha mais forte.';
    case 'network':
      return 'Sem conexão. Verifique sua internet e tente novamente.';
    case 'unknown':
      return 'Não foi possível concluir agora. Tente novamente.';
  }
}
