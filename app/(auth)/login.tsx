import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { useResponsive, useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { signInWithEmail, signInWithOAuth } from '../../lib/auth';

export default function LoginScreen() {
  const theme = useTheme();
  const responsive = useResponsive();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState<
    'google' | 'apple' | null
  >(null);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmail(email.trim(), password);
      router.replace('/(protected)/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setError('');
    setOauthLoadingProvider(provider);
    try {
      await signInWithOAuth(provider);
    } catch (err: any) {
      setError(err.message ?? `Failed to sign in with ${provider}.`);
    } finally {
      setOauthLoadingProvider(null);
    }
  };

  return (
    <SafeAreaWrapper>
      <Header title="Sign In" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.authContainer, { maxWidth: responsive.authMaxWidth }]}>
          <View style={styles.hero}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sign in to access your personalized tools and sync across devices.
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorLight }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <TextInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
            />
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          />

          <View style={styles.oauthSection}>
            <Button
              title="Continue with Google"
              onPress={() => handleOAuthSignIn('google')}
              variant="outline"
              size="md"
              fullWidth
              loading={oauthLoadingProvider === 'google'}
            />
            <Button
              title="Continue with Apple"
              onPress={() => handleOAuthSignIn('apple')}
              variant="outline"
              size="md"
              fullWidth
              loading={oauthLoadingProvider === 'apple'}
            />
          </View>

          <Button
            title="Forgot Password?"
            onPress={() => router.push('/(auth)/forgot-password')}
            variant="ghost"
            size="sm"
          />

          <View style={styles.signupPrompt}>
            <Text style={[styles.signupText, { color: theme.colors.textSecondary }]}>
              Don't have an account?
            </Text>
            <Button
              title="Create Account"
              onPress={() => router.replace('/(auth)/signup')}
              variant="ghost"
              size="sm"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.xl,
    paddingBottom: spacing['3xl'],
    alignItems: 'center',
  },
  authContainer: {
    width: '100%',
  },
  hero: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  form: {
    gap: spacing.base,
  },
  oauthSection: {
    gap: spacing.sm,
  },
  errorBanner: {
    padding: spacing.md,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  signupPrompt: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  signupText: {
    fontSize: 14,
  },
});
