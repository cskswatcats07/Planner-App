import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';

export default function TermsOfServiceScreen() {
  const theme = useTheme();

  return (
    <SafeAreaWrapper>
      <Header title="Terms of Service" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          MindPilot Terms of Service (Foundation Stub)
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          By using MindPilot, you agree to these terms. This is a baseline policy
          for the MVP and will be expanded before production release.
        </Text>
        <Text style={[styles.subheading, { color: theme.colors.text }]}>
          Acceptable Use
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          MindPilot is intended for personal organization and daily life support.
          You agree not to misuse the service or attempt unauthorized access.
        </Text>
        <Text style={[styles.subheading, { color: theme.colors.text }]}>
          Accounts
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          You are responsible for safeguarding your account credentials and
          keeping your account information accurate.
        </Text>
        <Text style={[styles.subheading, { color: theme.colors.text }]}>
          Limitation
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          MindPilot does not provide medical care or diagnosis. Use of the app is
          at your own discretion and risk.
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
