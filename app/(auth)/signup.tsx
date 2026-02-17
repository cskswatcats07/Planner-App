import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { useResponsive, useTheme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { signUpWithEmail } from '../../lib/auth';
import { DISCLAIMERS } from '../../constants/disclaimers';

export default function SignupScreen() {
  const theme = useTheme();
  const responsive = useResponsive();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!consentChecked) {
      setError('Please accept the terms to continue.');
      return;
    }

    if (!ageConfirmed) {
      setError('Please confirm you are 13 years or older.');
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail(email.trim(), password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaWrapper>
        <Header title="Account Created" showBack />
        <View style={styles.successContainer}>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>
            Check Your Email
          </Text>
          <Text style={[styles.successDesc, { color: theme.colors.textSecondary }]}>
            We've sent a confirmation link to {email}. Please verify your email
            to complete registration.
          </Text>
          <Button
            title="Go to Sign In"
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
      <Header title="Create Account" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.authContainer, { maxWidth: responsive.authMaxWidth }]}>
          <View style={styles.hero}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Get Started
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Create an account to unlock all tools and sync your data across devices.
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
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
            />
            <TextInput
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
            />
          </View>

          <View style={styles.checkboxSection}>
            <Checkbox
              checked={ageConfirmed}
              onToggle={() => setAgeConfirmed(!ageConfirmed)}
              label={DISCLAIMERS.ageGate}
              theme={theme}
            />
            <Checkbox
              checked={consentChecked}
              onToggle={() => setConsentChecked(!consentChecked)}
              label={DISCLAIMERS.consentCheckbox}
              theme={theme}
            />
          </View>

          <Button
            title="Create Account"
            onPress={handleSignup}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          />

          <View style={styles.loginPrompt}>
            <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
              Already have an account?
            </Text>
            <Button
              title="Sign In"
              onPress={() => router.replace('/(auth)/login')}
              variant="ghost"
              size="sm"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function Checkbox({
  checked,
  onToggle,
  label,
  theme,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  theme: any;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={styles.checkboxRow}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.checkboxBox,
          {
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            backgroundColor: checked ? theme.colors.primary : 'transparent',
          },
        ]}
      >
        {checked && (
          <Text style={styles.checkboxCheck}>✓</Text>
        )}
      </View>
      <Text style={[styles.checkboxLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
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
  errorBanner: {
    padding: spacing.md,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  checkboxSection: {
    gap: spacing.base,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
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
  loginPrompt: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  loginText: {
    fontSize: 14,
  },
});
