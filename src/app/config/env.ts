import { z } from 'zod';

const optionalUrl = z.union([z.literal(''), z.string().url()]).default('');

const envSchema = z.object({
  appEnv: z.enum(['development', 'preview', 'production', 'test']).default('development'),
  apiBaseUrl: z.string().url().default('http://localhost:8000'),
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
  throw new Error(`Invalid public application configuration: ${parsed.error.issues[0]?.message}`);
}

export const env = parsed.data;
export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);
