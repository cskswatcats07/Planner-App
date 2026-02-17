import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '../components/layout/SafeAreaWrapper';
import { Button } from '../components/ui/Button';
import { useTheme } from '../theme';
import { spacing } from '../theme/spacing';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { DISCLAIMERS } from '../constants/disclaimers';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, isLoading, isInitialized } = useAuthStore();
  const { loadSavedResult, result } = useAssessmentStore();

  useEffect(() => {
    loadSavedResult();
  }, [loadSavedResult]);

  useEffect(() => {
    if (isInitialized && user) {
      router.replace('/(protected)/dashboard');
    }
  }, [isInitialized, user, router]);

  if (isLoading || !isInitialized) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <Text style={[styles.logo, { color: theme.colors.primary }]}>
            MindPilot
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={[styles.logo, { color: theme.colors.primary }]}>
            MindPilot
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            Your personal guide to daily life management
          </Text>
        </View>

        <View style={styles.actions}>
          {result ? (
            <>
              <Button
                title="View Your Results"
                onPress={() => router.push('/(public)/assessment/results')}
                variant="primary"
                size="lg"
                fullWidth
              />
              <View style={styles.spacer} />
              <Button
                title="Explore Features"
                onPress={() => router.push('/(public)/explore')}
                variant="outline"
                size="lg"
                fullWidth
              />
            </>
          ) : (
            <>
              <Button
                title="Take the Quick Assessment"
                onPress={() => router.push('/(public)/assessment')}
                variant="primary"
                size="lg"
                fullWidth
              />
              <View style={styles.spacer} />
              <Button
                title="Explore Features"
                onPress={() => router.push('/(public)/explore')}
                variant="outline"
                size="lg"
                fullWidth
              />
            </>
          )}

          <View style={styles.spacerLg} />

          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            variant="ghost"
            size="md"
          />
        </View>

        <Text style={[styles.disclaimer, { color: theme.colors.textTertiary }]}>
          {DISCLAIMERS.appGeneral}
        </Text>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing['3xl'],
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  spacer: {
    height: spacing.md,
  },
  spacerLg: {
    height: spacing.xl,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
