import { AuthRetryableFetchError } from '@supabase/supabase-js';

import { mapAuthError } from './map-auth-error';

describe('mapAuthError', () => {
  it.each([
    ['invalid_credentials', 'invalid-credentials'],
    ['user_already_exists', 'email-in-use'],
    ['email_exists', 'email-in-use'],
    ['email_address_invalid', 'invalid-email'],
    ['weak_password', 'weak-password'],
    ['some_new_code', 'unknown'],
  ])('código "%s" → "%s"', (code, kind) => {
    expect(mapAuthError({ code, message: 'x' })).toMatchObject({ kind });
  });

  it('reconhece falha de rede', () => {
    expect(mapAuthError(new AuthRetryableFetchError('Failed to fetch', 0))).toMatchObject({
      kind: 'network',
    });
  });

  it('trata valores sem código como desconhecidos', () => {
    expect(mapAuthError(new Error('boom'))).toMatchObject({ kind: 'unknown' });
  });
});
