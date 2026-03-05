import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';

export default function FAQScreen() {
  const theme = useTheme();

  return (
    <SafeAreaWrapper>
      <Header title="FAQs" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="outlined" padding="lg" style={styles.block}>
          <Text style={[styles.question, { color: theme.colors.text }]}>
            Do I have to create an account to see results?
          </Text>
          <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>
            No. You can complete either the Quick or Detailed Assessment and see
            a summary of your challenge areas without signing up. Creating an
            account simply unlocks saved history, richer charts, and
            personalized recommendations.
          </Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.block}>
          <Text style={[styles.question, { color: theme.colors.text }]}>
            How do I rearrange or hide tools?
          </Text>
          <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>
            From the home screen tap &quot;Customize tools&quot; to pin your
            favorites to the top or hide tools you rarely use. You can change
            this at any time.
          </Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.block}>
          <Text style={[styles.question, { color: theme.colors.text }]}>
            Will notifications be overwhelming?
          </Text>
          <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>
            MindPilot keeps nudges small and purposeful. You choose which tools
            can send reminders, and you can turn them off in Settings or your
            device notification settings.
          </Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.block}>
          <Text style={[styles.question, { color: theme.colors.text }]}>
            Is this a medical or diagnostic app?
          </Text>
          <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>
            No. MindPilot is a practical support tool and does not diagnose or
            treat any condition. It&apos;s designed to sit alongside your own
            judgment and professional care, not replace them.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  block: {
    gap: spacing.sm,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
  },
  answer: {
    fontSize: 14,
    lineHeight: 21,
  },
});

