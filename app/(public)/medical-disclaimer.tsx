import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { DISCLAIMERS } from '../../constants/disclaimers';

export default function MedicalDisclaimerScreen() {
  const theme = useTheme();

  return (
    <SafeAreaWrapper>
      <Header title="Medical Disclaimer" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          Medical Disclaimer
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          {DISCLAIMERS.appGeneral}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          Assessment results are self-reported and used only for in-app
          personalization. They are not a diagnosis, treatment recommendation, or
          substitute for licensed care.
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          If you have urgent concerns or are in crisis, contact local emergency
          services or a qualified healthcare professional.
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
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
});
