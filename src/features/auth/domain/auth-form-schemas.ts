import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 6;

const email = z.string().trim().min(1, 'Informe seu e-mail.').pipe(z.email('E-mail inválido.'));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe seu nome.'),
    email,
    password: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });

export type SignInForm = z.infer<typeof signInSchema>;
export type SignUpForm = z.infer<typeof signUpSchema>;
