import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme, moduleColors, useResponsive } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { APP_MODULES } from '../../constants/modules';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAuthStore } from '../../store/authStore';
import type { ModuleColorKey } from '../../theme/colors';

export default function DashboardScreen() {
  const theme = useTheme();
  const responsive = useResponsive();
  const router = useRouter();
  const { user } = useAuthStore();
  const { result, loadSavedResult, isLoaded } = useAssessmentStore();

  useEffect(() => {
    if (!isLoaded) {
      loadSavedResult();
    }
  }, [isLoaded, loadSavedResult]);

  const recommendedModules = result
    ? APP_MODULES.filter((m) => result.recommendedModules.includes(m.id))
    : [];
  const otherModules = result
    ? APP_MODULES.filter((m) => !result.recommendedModules.includes(m.id))
    : APP_MODULES;

  const columns = responsive.gridColumns;
  const availableWidth =
    Math.min(responsive.width, responsive.maxContentWidth) -
    responsive.horizontalPadding * 2 -
    spacing.md * (columns - 1);
  const moduleCardWidth = Math.max(120, availableWidth / columns);

  return (
    <SafeAreaWrapper>
      <Header
        title="MindPilot"
        rightAction={{
          icon: 'settings-outline',
          onPress: () => router.push('/(protected)/settings'),
          accessibilityLabel: 'Settings',
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <Text style={[styles.greetingText, { color: theme.colors.text }]}>
            Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </Text>
          <Text style={[styles.greetingSubtext, { color: theme.colors.textSecondary }]}>
            {result
              ? 'Here are your personalized tools.'
              : 'Take the assessment to get personalized recommendations.'}
          </Text>
        </View>

        <Card variant="outlined" padding="lg" style={styles.healthCta}>
          <Text style={[styles.ctaTitle, { color: theme.colors.text }]}>
            Health Dashboard
          </Text>
          <Text style={[styles.ctaDesc, { color: theme.colors.textSecondary }]}>
            Securely track prescriptions, nutrition, and health metrics in one
            place. All fields are optional and encrypted before they leave your
            device.
          </Text>
          <Button
            title="Open Health Dashboard"
            onPress={() => router.push('/(protected)/health')}
            variant="outline"
            size="md"
            fullWidth
          />
        </Card>

        {!result && (
          <Card variant="elevated" padding="lg" style={styles.assessmentCta}>
            <Text style={[styles.ctaTitle, { color: theme.colors.text }]}>
              Personalize Your Experience
            </Text>
            <Text style={[styles.ctaDesc, { color: theme.colors.textSecondary }]}>
              Take a quick 3-5 minute assessment to discover which tools are
              best suited for you.
            </Text>
            <Button
              title="Start Assessment"
              onPress={() => router.push('/(public)/assessment')}
              variant="primary"
              size="md"
              fullWidth
            />
          </Card>
        )}

        {recommendedModules.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recommended For You
            </Text>
            <View style={styles.moduleGrid}>
              {recommendedModules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  theme={theme}
                  router={router}
                  width={moduleCardWidth}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {recommendedModules.length > 0 ? 'All Tools' : 'Your Tools'}
          </Text>
          <View style={styles.moduleGrid}>
            {(recommendedModules.length > 0 ? otherModules : APP_MODULES).map(
              (mod) => (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  theme={theme}
                  router={router}
                  width={moduleCardWidth}
                />
              )
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function ModuleCard({
  module: mod,
  theme,
  router,
  width,
}: {
  module: (typeof APP_MODULES)[number];
  theme: any;
  router: any;
  width: number;
}) {
  const colorKey = mod.colorKey as ModuleColorKey;
  const color = moduleColors[colorKey]?.main ?? theme.colors.primary;
  const lightColor = moduleColors[colorKey]?.light ?? theme.colors.primaryLight;

  return (
    <Card
      variant="elevated"
      padding="base"
      onPress={() => router.push(mod.route)}
      style={[styles.moduleCard, { width }]}
    >
      <View style={[styles.iconContainer, { backgroundColor: lightColor }]}>
        <Ionicons
          name={mod.icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color={color}
        />
      </View>
      <Text style={[styles.moduleName, { color: theme.colors.text }]} numberOfLines={1}>
        {mod.shortName}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  greeting: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '700',
  },
  greetingSubtext: {
    fontSize: 15,
    lineHeight: 22,
  },
  assessmentCta: {
    gap: spacing.md,
  },
  healthCta: {
    gap: spacing.md,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  ctaDesc: {
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  moduleCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
