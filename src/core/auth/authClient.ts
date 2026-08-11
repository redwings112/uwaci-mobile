import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, hasSupabaseConfig } from '@/application/config/env';
import { secureStorage } from '@/core/storage/secureStorage';

let client: SupabaseClient | null = null;

export function getAuthClient(): SupabaseClient | null {
  if (!hasSupabaseConfig) return null;
  client ??= createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      storage: {
        getItem: secureStorage.get,
        setItem: secureStorage.set,
        removeItem: secureStorage.remove,
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}
