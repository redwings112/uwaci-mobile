/** Convert provider-specific login failures into clear, safe user guidance. */
export function mapAuthenticationError(error: { message?: string }): string {
  const message = error.message?.toLowerCase() ?? '';
  if (/(network|fetch|socket|timed? out|connection)/.test(message))
    return 'We could not reach Uwaci. Check your connection and try again.';
  if (/(invalid login|invalid credentials|password)/.test(message))
    return 'That email or password is not correct. Please try again.';
  if (/(email.*confirm|confirm.*email)/.test(message))
    return 'Please confirm your email, then sign in.';
  if (/(already registered|already been registered|user already exists)/.test(message))
    return 'An account already exists for that email. Try signing in instead.';
  return 'We could not complete sign-in right now. Please try again.';
}
