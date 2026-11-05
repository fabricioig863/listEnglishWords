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
  it('signs in and maps the user to the app model', async () => {
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

  it('maps Supabase errors to domain errors', async () => {
    const auth = createFakeAuth({
      signInWithPassword: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: { code: 'invalid_credentials' } }),
    });

    await expect(
      createSupabaseAuthRepository(auth).signIn({ email: 'a@b.com', password: 'x' }),
    ).rejects.toMatchObject({ kind: 'invalid-credentials' });
  });

  it('sends the name as metadata on sign-up', async () => {
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

  it('fails when sign-up returns no session (email confirmation enabled)', async () => {
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

  it('unsubscribes when the returned function is called', () => {
    const unsubscribe = jest.fn();
    const auth = createFakeAuth({
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe } } }),
    });

    const stop = createSupabaseAuthRepository(auth).onAuthStateChange(jest.fn());
    stop();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
