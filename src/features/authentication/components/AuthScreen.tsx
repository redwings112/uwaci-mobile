import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';

import { getAuthClient } from '@/core/auth/authClient';
import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { Button } from '@/shared/components/Button/Button';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';

export function AuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const client = getAuthClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const signUp = mode === 'sign-up';

  const submit = async () => {
    if (!client) {
      setMessage('Account access is unavailable because public Supabase settings are missing.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = signUp
        ? await client.auth.signUp({ email: email.trim(), password })
        : await client.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) {
        setMessage(result.error.message);
        return;
      }
      if (signUp && !result.data.session) {
        setMessage('Check your email to confirm your account, then sign in.');
        return;
      }
      await secureStorage.set(STORAGE_KEYS.onboardingComplete, 'true');
      router.replace('/(app)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas dark:bg-[#111126]">
      <AppHeader back onBack={() => router.back()} actionIcon="?" actionLabel="Account help" />
      <View className="flex-1 px-5 pt-6">
        <Typography variant="title">{signUp ? 'Create your account' : 'Welcome back'}</Typography>
        <Typography className="mt-2 text-muted">
          {signUp
            ? 'Save your Uwaci experience across devices.'
            : 'Sign in to continue with your account.'}
        </Typography>
        <SurfaceCard className="mt-6 gap-4 p-5">
          <View>
            <Typography variant="label">Email</Typography>
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              className="mt-2 min-h-12 rounded-control border border-border bg-canvas px-4 text-ink dark:border-white/10 dark:bg-[#111126] dark:text-white"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#777789"
              value={email}
            />
          </View>
          <View>
            <Typography variant="label">Password</Typography>
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              className="mt-2 min-h-12 rounded-control border border-border bg-canvas px-4 text-ink dark:border-white/10 dark:bg-[#111126] dark:text-white"
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#777789"
              secureTextEntry
              value={password}
            />
          </View>
          {message ? (
            <Typography className="text-danger" accessibilityRole="alert">
              {message}
            </Typography>
          ) : null}
          <Button
            disabled={!email.trim() || password.length < 6}
            loading={loading}
            onPress={() => void submit()}
          >
            {signUp ? 'Create account' : 'Sign in'}
          </Button>
        </SurfaceCard>
        <Pressable
          className="mt-5 min-h-11 items-center justify-center"
          onPress={() => router.replace(signUp ? '/(auth)/sign-in' : '/(auth)/sign-up')}
        >
          <Typography className="text-brand">
            {signUp ? 'Already have an account? Sign in' : 'New to Uwaci? Create account'}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}
