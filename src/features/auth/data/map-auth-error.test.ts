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
  ])('code "%s" → "%s"', (code, kind) => {
    expect(mapAuthError({ code, message: 'x' })).toMatchObject({ kind });
  });

  it('recognizes network failures', () => {
    expect(mapAuthError(new AuthRetryableFetchError('Failed to fetch', 0))).toMatchObject({
      kind: 'network',
    });
  });

  it('treats values without a code as unknown', () => {
    expect(mapAuthError(new Error('boom'))).toMatchObject({ kind: 'unknown' });
  });
});
