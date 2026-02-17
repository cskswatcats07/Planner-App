import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { handleIncomingAuthUrl } from '../../lib/auth';

export default function DebugDeepLinkTestScreen() {
  const theme = useTheme();
  const authPath = '/(auth)/login';
  const redirectUrl = useMemo(() => Linking.createURL(authPath), [authPath]);
  const [inputUrl, setInputUrl] = useState(redirectUrl);
  const [resultMessage, setResultMessage] = useState(
    'Paste an auth callback URL and validate session parsing.'
  );
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    const value = inputUrl.trim();
    if (!value) {
      setResultMessage('Enter a URL first.');
      return;
    }

    setIsTesting(true);
    try {
      const handled = await handleIncomingAuthUrl(value);
      setResultMessage(
        handled
          ? 'Callback handled successfully. Session exchange/parsing completed.'
          : 'URL parsed, but no auth token or code was found.'
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown callback error.';
      setResultMessage(`Callback failed: ${message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <Header title="Debug Deep Link Test" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Auth Callback Validator</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Use this dev-only screen on device to quickly validate OAuth callback handling.
          </Text>
          <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>
            Expected redirect base: {redirectUrl}
          </Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <TextInput
            label="Callback URL"
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="mindpilot://(auth)/login#access_token=..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.row}>
            <Button
              title="Use Redirect Base"
              onPress={() => setInputUrl(redirectUrl)}
              variant="ghost"
              size="md"
              fullWidth
              style={styles.flex}
            />
            <Button
              title="Run Test"
              onPress={handleTest}
              variant="primary"
              size="md"
              fullWidth
              loading={isTesting}
              style={styles.flex}
            />
          </View>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{resultMessage}</Text>
        </Card>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
