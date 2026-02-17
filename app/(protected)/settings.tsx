import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { DISCLAIMERS } from '../../constants/disclaimers';
import { signOut } from '../../lib/auth';
import { clearAssessmentResult } from '../../lib/storage';
import { useAssessmentStore } from '../../store/assessmentStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const { result, reset } = useAssessmentStore();

  const handleExportData = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      assessmentResult: result,
    };

    Alert.alert(
      'Data Export Placeholder',
      `Export support is included in the foundation phase. Current payload preview:\n\n${JSON.stringify(payload, null, 2)}`
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete Local Data',
      'This clears locally stored assessment data from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsClearingData(true);
            try {
              await clearAssessmentResult();
              reset();
            } finally {
              setIsClearingData(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace('/(auth)/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <Header title="Settings" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Privacy Controls
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Manage your access rights, including data export and deletion.
          </Text>
          <Button
            title="Export My Data (Placeholder)"
            onPress={handleExportData}
            variant="outline"
            size="md"
            fullWidth
          />
          <Button
            title="Delete Local Assessment Data"
            onPress={handleDeleteData}
            variant="ghost"
            size="md"
            fullWidth
            loading={isClearingData}
          />
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Legal
          </Text>
          <Button
            title="Privacy Policy"
            onPress={() => router.push('/(public)/privacy-policy')}
            variant="outline"
            size="md"
            fullWidth
          />
          <Button
            title="Terms of Service"
            onPress={() => router.push('/(public)/terms-of-service')}
            variant="outline"
            size="md"
            fullWidth
          />
          <Button
            title="Medical Disclaimer"
            onPress={() => router.push('/(public)/medical-disclaimer')}
            variant="outline"
            size="md"
            fullWidth
          />
        </Card>

        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Disclaimer
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            {DISCLAIMERS.appGeneral}
          </Text>
        </Card>

        {__DEV__ ? (
          <Card variant="outlined" padding="lg" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Debug
            </Text>
            <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
              Internal release tools for validating callbacks and platform behavior.
            </Text>
            <Button
              title="Deep Link Test"
              onPress={() => router.push('/(protected)/debug-deep-link-test')}
              variant="outline"
              size="md"
              fullWidth
            />
          </Card>
        ) : null}

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="primary"
          size="lg"
          fullWidth
          loading={isSigningOut}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
});
