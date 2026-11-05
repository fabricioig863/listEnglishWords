import { z } from 'zod';

import { signInSchema, signUpSchema } from './auth-form-schemas';

const VALID_SIGN_UP = {
  name: 'Ana',
  email: 'ana@email.com',
  password: 'secret1',
  confirmPassword: 'secret1',
};

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe('signInSchema', () => {
  it('apara espaços do e-mail', () => {
    const result = signInSchema.safeParse({ email: '  ana@email.com ', password: 'x' });

    expect(result.data).toEqual({ email: 'ana@email.com', password: 'x' });
  });

  it('não exige tamanho mínimo de senha no login', () => {
    expect(signInSchema.safeParse({ email: 'ana@email.com', password: '1' }).success).toBe(true);
  });

  it('aponta campos vazios', () => {
    const errors = fieldErrors(signInSchema.safeParse({ email: '', password: '' }));

    expect(errors).toMatchObject({
      email: ['Informe seu e-mail.'],
      password: ['Informe sua senha.'],
    });
  });
});

describe('signUpSchema', () => {
  it('aceita um cadastro válido', () => {
    expect(signUpSchema.safeParse(VALID_SIGN_UP).success).toBe(true);
  });

  it.each([
    ['nome vazio', { name: '  ' }, 'name', 'Informe seu nome.'],
    ['e-mail inválido', { email: 'ana@' }, 'email', 'E-mail inválido.'],
    [
      'senha curta',
      { password: '123', confirmPassword: '123' },
      'password',
      'A senha precisa ter pelo menos 6 caracteres.',
    ],
    [
      'senhas diferentes',
      { confirmPassword: 'other1' },
      'confirmPassword',
      'As senhas não conferem.',
    ],
  ])('rejeita %s', (_, overrides, field, message) => {
    const errors = fieldErrors(signUpSchema.safeParse({ ...VALID_SIGN_UP, ...overrides }));

    expect(errors[field as keyof typeof errors]).toContain(message);
  });
});
