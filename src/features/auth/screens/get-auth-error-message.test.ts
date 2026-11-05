import { AuthError } from '../domain/auth-error';

import { getAuthErrorMessage } from './get-auth-error-message';

describe('getAuthErrorMessage', () => {
  it('does not reveal whether the email or the password was wrong', () => {
    expect(getAuthErrorMessage(new AuthError('invalid-credentials'))).toBe(
      'E-mail ou senha incorretos.',
    );
  });

  it('guides the user when the email is already registered', () => {
    expect(getAuthErrorMessage(new AuthError('email-in-use'))).toContain('Tente entrar');
  });

  it('uses the generic message for unknown errors', () => {
    expect(getAuthErrorMessage(new Error('boom'))).toBe(
      'Não foi possível concluir agora. Tente novamente.',
    );
  });
});
