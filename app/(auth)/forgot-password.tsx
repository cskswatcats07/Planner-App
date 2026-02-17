import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { resetPassword } from '../../lib/auth';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaWrapper>
        <Header title="Password Reset" showBack />
        <View style={styles.successContainer}>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>
            Check Your Email
          </Text>
          <Text style={[styles.successDesc, { color: theme.colors.textSecondary }]}>
            If an account exists with {email}, you'll receive a password reset
            link shortly.
          </Text>
          <Button
            title="Return to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            variant="primary"
            size="lg"
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Header title="Reset Password" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Forgot Password?
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter the email address you used to create your account, and we'll
            send you a link to reset your password.
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorLight }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </View>
        ) : null}

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

        <Button
          title="Send Reset Link"
          onPress={handleReset}
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        />

        <Button
          title="Back to Sign In"
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.xl,
    paddingBottom: spacing['3xl'],
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
  errorBanner: {
    padding: spacing.md,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  successDesc: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
});
