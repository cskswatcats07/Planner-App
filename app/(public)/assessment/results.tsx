import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '../../../components/layout/SafeAreaWrapper';
import { Header } from '../../../components/layout/Header';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { CategoryChart } from '../../../components/assessment/CategoryChart';
import { RadarChart } from '../../../components/assessment/RadarChart';
import { useTheme, moduleColors } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { DISCLAIMERS } from '../../../constants/disclaimers';
import { APP_MODULES } from '../../../constants/modules';
import { useAssessmentStore } from '../../../store/assessmentStore';
import { useAuthStore } from '../../../store/authStore';
import type { ModuleColorKey } from '../../../theme/colors';

export default function AssessmentResultsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { result, loadSavedResult, isLoaded } = useAssessmentStore();
   const { user } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) {
      loadSavedResult();
    }
  }, [isLoaded, loadSavedResult]);

  if (!result) {
    return (
      <SafeAreaWrapper>
        <Header title="Results" showBack />
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No assessment results yet.
          </Text>
          <Button
            title="Take Assessment"
            onPress={() => router.push('/(public)/assessment')}
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  const recommendedModules = APP_MODULES.filter((m) =>
    result.recommendedModules.includes(m.id)
  );

  const isAuthed = !!user;
  const detailedUnlocked = isAuthed;

  const sortedScores = [...result.categoryScores].sort(
    (a, b) => b.percentage - a.percentage
  );
  const topScores = sortedScores.slice(0, 3);

  return (
    <SafeAreaWrapper>
      <Header title="Your Results" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Your Challenge Profile
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {DISCLAIMERS.assessmentResults}
          </Text>
        </View>

        <Card variant="elevated" padding="lg">
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Summary (no account required)
          </Text>
          <View style={{ height: spacing.sm }} />
          {topScores.length > 0 ? (
            <View style={styles.summaryList}>
              {topScores.map((score) => (
                <View key={score.category} style={styles.summaryItem}>
                  <Text
                    style={[styles.summaryCategory, { color: theme.colors.text }]}
                  >
                    {score.label}
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {(score.percentage * 100).toFixed(0)}% intensity
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.summaryEmpty, { color: theme.colors.textSecondary }]}>
              Your responses were too sparse to summarize. You can retake the
              assessment at any time.
            </Text>
          )}
        </Card>

        {detailedUnlocked ? (
          <Card variant="elevated" padding="lg">
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Challenge Intensity (detailed)
            </Text>
            <View style={{ height: spacing.base }} />
            <RadarChart scores={result.categoryScores} />
            <View style={{ height: spacing.base }} />
            <CategoryChart scores={result.categoryScores} />
          </Card>
        ) : (
          <Card variant="outlined" padding="lg">
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Unlock detailed charts & personalized tools
            </Text>
            <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
              Create a free account to see full charts, trends, and personalized
              tool recommendations based on your results.
            </Text>
            <View style={{ height: spacing.sm }} />
            <Button
              title="Create Account"
              onPress={() => router.push('/(auth)/signup')}
              variant="primary"
              size="md"
              fullWidth
            />
            <Button
              title="Sign In"
              onPress={() => router.push('/(auth)/login')}
              variant="ghost"
              size="sm"
              fullWidth
            />
          </Card>
        )}

        {detailedUnlocked && recommendedModules.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recommended For You
            </Text>
            <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
              Based on your responses, these tools may be most helpful:
            </Text>
            <View style={styles.moduleList}>
              {recommendedModules.map((mod) => {
                const colorKey = mod.colorKey as ModuleColorKey;
                const color = moduleColors[colorKey]?.main ?? theme.colors.primary;
                return (
                  <Card
                    key={mod.id}
                    variant="outlined"
                    padding="base"
                    style={[styles.moduleCard, { borderLeftColor: color, borderLeftWidth: 3 }]}
                  >
                    <Text style={[styles.moduleName, { color: theme.colors.text }]}>
                      {mod.name}
                    </Text>
                    <Text
                      style={[styles.moduleDesc, { color: theme.colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {mod.description}
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          {!detailedUnlocked && (
            <Button
              title="Create Account to Unlock More Detail"
              onPress={() => router.push('/(auth)/signup')}
              variant="primary"
              size="lg"
              fullWidth
            />
          )}
          <Button
            title="Explore All Features"
            onPress={() => router.push('/(public)/explore')}
            variant="outline"
            size="md"
            fullWidth
          />
          <Button
            title="Retake Assessment"
            onPress={() => router.push('/(public)/assessment')}
            variant="ghost"
            size="sm"
          />
        </View>

        <Text style={[styles.disclaimer, { color: theme.colors.textTertiary }]}>
          {DISCLAIMERS.assessmentFooter}
        </Text>
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
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionDesc: {
    fontSize: 14,
    lineHeight: 21,
  },
  summaryList: {
    gap: spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCategory: {
    fontSize: 15,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
  },
  summaryEmpty: {
    fontSize: 13,
    lineHeight: 19,
  },
  moduleList: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  moduleCard: {
    gap: spacing.xs,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
  },
  moduleDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.base,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
