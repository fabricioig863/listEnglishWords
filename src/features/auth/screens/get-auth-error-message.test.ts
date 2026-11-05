import { AuthError } from '../domain/auth-error';

import { getAuthErrorMessage } from './get-auth-error-message';

describe('getAuthErrorMessage', () => {
  it('não revela se o erro foi no e-mail ou na senha', () => {
    expect(getAuthErrorMessage(new AuthError('invalid-credentials'))).toBe(
      'E-mail ou senha incorretos.',
    );
  });

  it('orienta o usuário quando o e-mail já tem conta', () => {
    expect(getAuthErrorMessage(new AuthError('email-in-use'))).toContain('Tente entrar');
  });

  it('usa a mensagem genérica para erros desconhecidos', () => {
    expect(getAuthErrorMessage(new Error('boom'))).toBe(
      'Não foi possível concluir agora. Tente novamente.',
    );
  });
});
