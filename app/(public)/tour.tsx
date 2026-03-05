import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { useRouter } from 'expo-router';

export default function GuidedTourScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaWrapper>
      <Header title="Quick Tour" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" padding="lg" style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            1. Start with a quick check-in
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Use the Quick Assessment to get a fast snapshot across all tools.
            You&apos;ll see a short summary immediately, without needing an
            account.
          </Text>
        </Card>

        <Card variant="elevated" padding="lg" style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            2. Go deeper when you&apos;re ready
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            The Detailed Assessment adds more nuance per area. Sign up or sign
            in to unlock richer charts and personalized tool recommendations—
            only when you feel ready.
          </Text>
        </Card>

        <Card variant="elevated" padding="lg" style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            3. Your tools, your layout
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            The home screen keeps tools visible without endless scrolling. You
            can reorder and hide tools from the Customize Tools screen so your
            favorites stay within one tap.
          </Text>
        </Card>

        <Card variant="elevated" padding="lg" style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            4. Gentle nudges, not interruptions
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Notifications are opt-in and purpose-built: timers, reminders, and
            prompts stay calm and dismissible. Tooltips and help text stay
            small and out of your way unless you tap them.
          </Text>
        </Card>

        <Button
          title="Got it — take me home"
          onPress={() => router.replace('/')}
          variant="primary"
          size="lg"
          fullWidth
        />
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
  card: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
});

