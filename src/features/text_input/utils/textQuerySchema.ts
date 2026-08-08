import { z } from 'zod';

export const textQuerySchema = z
  .string()
  .trim()
  .min(1, 'Enter a question first.')
  .max(2000, 'Please shorten your question.');
