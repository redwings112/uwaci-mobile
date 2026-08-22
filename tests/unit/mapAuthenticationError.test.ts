import { mapAuthenticationError } from '@/core/errors/mapAuthenticationError';

describe('mapAuthenticationError', () => {
  it.each([
    ['Network request failed', 'We could not reach Uwaci. Check your connection and try again.'],
    ['Invalid login credentials', 'That email or password is not correct. Please try again.'],
    ['Email not confirmed', 'Please confirm your email, then sign in.'],
    [
      'User already registered',
      'An account already exists for that email. Try signing in instead.',
    ],
  ])('replaces provider wording for %s', (providerMessage, expected) => {
    expect(mapAuthenticationError({ message: providerMessage })).toBe(expected);
  });

  it('never returns an unknown provider error verbatim', () => {
    expect(mapAuthenticationError({ message: 'java.net.SocketException: secret detail' })).toBe(
      'We could not reach Uwaci. Check your connection and try again.',
    );
  });
});
