import type { AuthUser } from './auth-user';

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = SignInParams & {
  name: string;
};

export interface AuthRepository {
  getCurrentUser(): Promise<AuthUser | null>;
  signIn(params: SignInParams): Promise<AuthUser>;
  signUp(params: SignUpParams): Promise<AuthUser>;
  signOut(): Promise<void>;
  onAuthStateChange(listener: (user: AuthUser | null) => void): () => void;
}
