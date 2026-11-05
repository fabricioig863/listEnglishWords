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
  it('trims the email', () => {
    const result = signInSchema.safeParse({ email: '  ana@email.com ', password: 'x' });

    expect(result.data).toEqual({ email: 'ana@email.com', password: 'x' });
  });

  it('does not require a minimum password length on sign-in', () => {
    expect(signInSchema.safeParse({ email: 'ana@email.com', password: '1' }).success).toBe(true);
  });

  it('flags empty fields', () => {
    const errors = fieldErrors(signInSchema.safeParse({ email: '', password: '' }));

    expect(errors).toMatchObject({
      email: ['Informe seu e-mail.'],
      password: ['Informe sua senha.'],
    });
  });
});

describe('signUpSchema', () => {
  it('accepts a valid sign-up', () => {
    expect(signUpSchema.safeParse(VALID_SIGN_UP).success).toBe(true);
  });

  it.each([
    ['an empty name', { name: '  ' }, 'name', 'Informe seu nome.'],
    ['an invalid email', { email: 'ana@' }, 'email', 'E-mail inválido.'],
    [
      'a short password',
      { password: '123', confirmPassword: '123' },
      'password',
      'A senha precisa ter pelo menos 6 caracteres.',
    ],
    [
      'mismatched passwords',
      { confirmPassword: 'other1' },
      'confirmPassword',
      'As senhas não conferem.',
    ],
  ])('rejects %s', (_, overrides, field, message) => {
    const errors = fieldErrors(signUpSchema.safeParse({ ...VALID_SIGN_UP, ...overrides }));

    expect(errors[field as keyof typeof errors]).toContain(message);
  });
});
