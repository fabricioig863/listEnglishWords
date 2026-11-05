import { createSupabaseAuthRepository, type SupabaseAuth } from './supabase-auth-repository';

const SUPABASE_USER = {
  id: 'user-1',
  email: 'ana@email.com',
  user_metadata: { name: 'Ana' },
};

function createFakeAuth(overrides: Partial<Record<keyof SupabaseAuth, jest.Mock>> = {}) {
  return {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn(),
    ...overrides,
  } as unknown as SupabaseAuth & Record<keyof SupabaseAuth, jest.Mock>;
}

describe('SupabaseAuthRepository', () => {
  it('entra e converte o usuário para o modelo do app', async () => {
    const auth = createFakeAuth({
      signInWithPassword: jest
        .fn()
        .mockResolvedValue({ data: { user: SUPABASE_USER }, error: null }),
    });

    const user = await createSupabaseAuthRepository(auth).signIn({
      email: 'ana@email.com',
      password: 'secret1',
    });

    expect(user).toEqual({ id: 'user-1', email: 'ana@email.com', name: 'Ana' });
  });

  it('converte o erro do Supabase em erro de domínio', async () => {
    const auth = createFakeAuth({
      signInWithPassword: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: { code: 'invalid_credentials' } }),
    });

    await expect(
      createSupabaseAuthRepository(auth).signIn({ email: 'a@b.com', password: 'x' }),
    ).rejects.toMatchObject({ kind: 'invalid-credentials' });
  });

  it('envia o nome como metadado no cadastro', async () => {
    const auth = createFakeAuth({
      signUp: jest.fn().mockResolvedValue({
        data: { user: SUPABASE_USER, session: { user: SUPABASE_USER } },
        error: null,
      }),
    });

    await createSupabaseAuthRepository(auth).signUp({
      name: 'Ana',
      email: 'ana@email.com',
      password: 'secret1',
    });

    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'ana@email.com',
      password: 'secret1',
      options: { data: { name: 'Ana' } },
    });
  });

  it('falha se o cadastro não devolver sessão (confirmação de e-mail ligada)', async () => {
    const auth = createFakeAuth({
      signUp: jest.fn().mockResolvedValue({
        data: { user: SUPABASE_USER, session: null },
        error: null,
      }),
    });

    await expect(
      createSupabaseAuthRepository(auth).signUp({ name: 'Ana', email: 'a@b.com', password: 'x' }),
    ).rejects.toMatchObject({ kind: 'unknown' });
  });

  it('cancela a escuta de sessão ao chamar a função devolvida', () => {
    const unsubscribe = jest.fn();
    const auth = createFakeAuth({
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe } } }),
    });

    const stop = createSupabaseAuthRepository(auth).onAuthStateChange(jest.fn());
    stop();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
