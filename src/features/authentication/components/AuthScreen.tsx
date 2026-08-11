import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAuthClient } from '@/core/auth/authClient';
import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { Button } from '@/shared/components/Button/Button';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';

import { PasswordInput } from './PasswordInput';

interface AuthScreenProps {
  mode: 'sign-in' | 'sign-up';
  next?: 'voice' | 'text';
  conversationId?: string;
}

export function AuthScreen({ mode, next, conversationId }: AuthScreenProps) {
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
      if (next === 'voice') {
        router.replace({ pathname: '/(app)', params: { startRecording: 'true' } });
      } else if (next === 'text') {
        router.replace({
          pathname: '/(app)/conversation/[conversationId]',
          params: {
            conversationId: conversationId ?? 'new',
            focusComposer: 'true',
          },
        });
      } else {
        router.replace('/(app)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <AppHeader back onBack={() => router.back()} actionIcon="?" actionLabel="Account help" />
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-5 pt-6"
          keyboardShouldPersistTaps="handled"
        >
          <Typography variant="title">{signUp ? 'Create your account' : 'Welcome back'}</Typography>
          <Typography className="mt-2 text-muted">
            {signUp
              ? 'Save your Uwaci experience across devices.'
              : 'Sign in to continue with your account.'}
          </Typography>
          {next ? (
            <View className="mt-4 rounded-control border border-brand/20 bg-lavender p-4">
              <Typography variant="label" className="text-brand">
                Sign in required
              </Typography>
              <Typography className="mt-1 text-ink">
                Guest access is disabled for this project. After signing in, Uwaci will return you
                to your {next === 'voice' ? 'voice question' : 'text conversation'}.
              </Typography>
            </View>
          ) : null}
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
              <PasswordInput mode={mode} onChangeText={setPassword} value={password} />
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
            onPress={() =>
              router.replace({
                pathname: signUp ? '/(auth)/sign-in' : '/(auth)/sign-up',
                params: {
                  ...(next ? { next } : {}),
                  ...(conversationId ? { conversationId } : {}),
                },
              })
            }
          >
            <Typography className="text-brand">
              {signUp ? 'Already have an account? Sign in' : 'New to Uwaci? Create account'}
            </Typography>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
