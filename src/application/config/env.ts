import { z } from 'zod';

const optionalUrl = z.union([z.literal(''), z.string().url()]).default('');

const envSchema = z.object({
  appEnv: z.enum(['development', 'preview', 'production', 'test']).default('development'),
  apiBaseUrl: z.string().url('Invalid API Base URL format'),
  supabaseUrl: optionalUrl,
  supabaseAnonKey: z.string().default(''),
});

const parsed = envSchema.safeParse({
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  const issue = parsed.error.issues[0];
  throw new Error(
    `Invalid public application configuration: [${issue?.path.join('.')}] ${issue?.message}`,
  );
}

export const env = parsed.data;
export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);
