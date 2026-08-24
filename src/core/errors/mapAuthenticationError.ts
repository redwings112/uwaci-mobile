import { i18n } from '@/localization';
/** Convert provider-specific login failures into clear, safe user guidance. */
export function mapAuthenticationError(error: { message?: string }): string {
  const message = error.message?.toLowerCase() ?? '';
  if (/(network|fetch|socket|timed? out|connection)/.test(message))
    return i18n.t('errors.authNetwork');
  if (/(invalid login|invalid credentials|password)/.test(message))
    return i18n.t('errors.authInvalid');
  if (/(email.*confirm|confirm.*email)/.test(message)) return i18n.t('errors.authConfirmEmail');
  if (/(already registered|already been registered|user already exists)/.test(message))
    return i18n.t('errors.authAlreadyExists');
  return i18n.t('errors.authGeneric');
}
