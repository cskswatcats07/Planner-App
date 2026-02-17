import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';

export default function PrivacyPolicyScreen() {
  const theme = useTheme();

  return (
    <SafeAreaWrapper>
      <Header title="Privacy Policy" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          MindPilot Privacy Policy (Foundation Stub)
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          This policy explains how MindPilot collects, stores, and uses your data.
          In this foundation phase, we focus on transparency and user control.
        </Text>
        <Text style={[styles.subheading, { color: theme.colors.text }]}>
          Data We Process
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          - Account data (email, authentication metadata){'\n'}
          - Self-assessment responses and profile preferences{'\n'}
          - Basic app usage required for service functionality
        </Text>
        <Text style={[styles.subheading, { color: theme.colors.text }]}>
          User Rights
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          You can request access, export, and deletion of your personal data. This
          supports obligations under PIPEDA and applicable state privacy laws.
        </Text>
        <Text style={[styles.subheading, { color: theme.colors.text }]}>
          Security & Sharing
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          Data is stored securely with Supabase infrastructure. We do not sell
          personal data and avoid third-party analytics in the MVP.
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textTertiary }]}>
          Last updated: Foundation MVP
        </Text>
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
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
});
