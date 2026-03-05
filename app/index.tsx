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
import { APP_MODULES } from '../constants/modules';
import { useToolStore, sortModulesWithPrefs } from '../store/toolStore';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, isLoading, isInitialized } = useAuthStore();
  const { loadSavedResult, result } = useAssessmentStore();
  const { preferences, hydrate } = useToolStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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

  const orderedModules = sortModulesWithPrefs(APP_MODULES, preferences);
  const primaryModules = orderedModules.slice(0, 8);

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

        <View style={styles.toolsSection}>
          <Text style={[styles.toolsTitle, { color: theme.colors.text }]}>
            Your tools at a glance
          </Text>
          <View style={styles.toolsGrid}>
            {primaryModules.map((mod) => (
              <Button
                key={mod.id}
                title={mod.shortName}
                onPress={() => router.push(mod.route)}
                variant="ghost"
                size="sm"
                fullWidth={false}
                style={styles.toolChip}
              />
            ))}
          </View>
          <Button
            title="Customize tools"
            onPress={() => router.push('/(public)/tools-customize')}
            variant="ghost"
            size="sm"
          />
          <Button
            title="Take a 30-second tour"
            onPress={() => router.push('/(public)/tour')}
            variant="ghost"
            size="sm"
          />
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
    paddingVertical: spacing['2xl'],
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 24,
  },
  toolsSection: {
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  toolChip: {
    minWidth: 96,
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
