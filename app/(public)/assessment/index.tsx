import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '../../../components/layout/SafeAreaWrapper';
import { Header } from '../../../components/layout/Header';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { DISCLAIMERS } from '../../../constants/disclaimers';
import {
  ASSESSMENT_QUESTIONS,
  QUICK_ASSESSMENT_QUESTIONS,
} from '../../../constants/assessment-questions';
import { useAssessmentStore } from '../../../store/assessmentStore';

export default function AssessmentIntroScreen() {
  const theme = useTheme();
  const router = useRouter();
  const start = useAssessmentStore((s) => s.start);

  const handleStartQuick = () => {
    start('quick');
    router.push('/(public)/assessment/questions');
  };

  const handleStartDetailed = () => {
    start('detailed');
    router.push('/(public)/assessment/questions');
  };

  return (
    <SafeAreaWrapper>
      <Header title="Self-Assessment" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Understand Your Challenges
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Answer a few quick questions to personalize your MindPilot experience.
          </Text>
        </View>

        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Quick assessment
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {QUICK_ASSESSMENT_QUESTIONS.length} questions · ~2–3 minutes
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Detailed assessment
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {ASSESSMENT_QUESTIONS.length} questions · ~5–7 minutes
            </Text>
          </View>
        </Card>

        <Card variant="elevated" style={styles.disclaimerCard}>
          <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
            {DISCLAIMERS.assessmentIntro}
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Quick Assessment"
            onPress={handleStartQuick}
            variant="primary"
            size="lg"
            fullWidth
          />
          <View style={styles.actionsSpacer} />
          <Button
            title="Detailed Assessment"
            onPress={handleStartDetailed}
            variant="outline"
            size="lg"
            fullWidth
          />
        </View>

        <Text style={[styles.footer, { color: theme.colors.textTertiary }]}>
          {DISCLAIMERS.assessmentFooter}
        </Text>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  disclaimerCard: {
    marginBottom: spacing['2xl'],
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    marginBottom: spacing['2xl'],
  },
  actionsSpacer: {
    height: spacing.sm,
  },
  footer: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
