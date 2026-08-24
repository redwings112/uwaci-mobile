import { z } from 'zod';
import { i18n } from '@/localization';

export const textQuerySchema = z
  .string()
  .trim()
  .min(1, { error: () => i18n.t('errors.questionEmpty') })
  .max(2000, { error: () => i18n.t('errors.questionTooLong') });
