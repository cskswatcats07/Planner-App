import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { useTheme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import { generateToolFeedback, type ToolFeedbackResult } from '../../lib/gemini';

interface AIFeedbackCardProps {
  toolName: string;
  contextSummary: string;
  presetPrompts?: string[];
}

export function AIFeedbackCard({
  toolName,
  contextSummary,
  presetPrompts = [],
}: AIFeedbackCardProps) {
  const theme = useTheme();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<ToolFeedbackResult | null>(null);
  const [allowContextForSession, setAllowContextForSession] = useState(false);

  const helperText = useMemo(
    () =>
      prompt.trim().length > 0
        ? 'AI will include your custom request.'
        : 'Optional: ask for specific coaching focus.',
    [prompt]
  );

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateToolFeedback({
        toolName,
        contextSummary: allowContextForSession
          ? contextSummary
          : 'Context sharing disabled for this session. Provide general coaching only.',
        userPrompt: prompt,
      });
      setFeedback(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to generate AI feedback.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" padding="lg" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        AI Coach ({toolName})
      </Text>
      <TouchableOpacity
        style={[styles.privacyRow, { borderColor: theme.colors.borderLight }]}
        onPress={() => setAllowContextForSession((current) => !current)}
        accessibilityRole="switch"
        accessibilityState={{ checked: allowContextForSession }}
      >
        <View style={styles.privacyCopy}>
          <Text style={[styles.privacyTitle, { color: theme.colors.text }]}>
            Share tool context this session
          </Text>
          <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>
            {allowContextForSession
              ? 'Enabled. Context can be sent to Gemini until this screen is closed.'
              : 'Disabled by default. AI uses your prompt only.'}
          </Text>
        </View>
        <View
          style={[
            styles.toggleDot,
            {
              backgroundColor: allowContextForSession
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}
        />
      </TouchableOpacity>
      <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>{helperText}</Text>
      {presetPrompts.length > 0 ? (
        <View style={styles.presetWrap}>
          {presetPrompts.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setPrompt(item)}
              style={[styles.presetChip, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.presetText, { color: theme.colors.textSecondary }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      <TextInput
        label="Optional prompt"
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Example: Give me 3 practical improvements for this week."
      />
      <Button
        title="Generate AI Feedback"
        onPress={handleGenerate}
        variant="outline"
        size="md"
        fullWidth
        loading={loading}
      />
      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
      {feedback ? (
        <View style={[styles.resultCard, { borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.summary, { color: theme.colors.text }]}>{feedback.summary}</Text>
          {feedback.strengths.length > 0 ? (
            <View style={styles.listBlock}>
              <Text style={[styles.listTitle, { color: theme.colors.textSecondary }]}>Strengths</Text>
              {feedback.strengths.map((item) => (
                <Text key={item} style={[styles.item, { color: theme.colors.textSecondary }]}>
                  - {item}
                </Text>
              ))}
            </View>
          ) : null}
          {feedback.improvements.length > 0 ? (
            <View style={styles.listBlock}>
              <Text style={[styles.listTitle, { color: theme.colors.textSecondary }]}>
                Improvements
              </Text>
              {feedback.improvements.map((item) => (
                <Text key={item} style={[styles.item, { color: theme.colors.textSecondary }]}>
                  - {item}
                </Text>
              ))}
            </View>
          ) : null}
          {feedback.promptSuggestions.length > 0 ? (
            <View style={styles.listBlock}>
              <Text style={[styles.listTitle, { color: theme.colors.textSecondary }]}>
                Suggested AI Prompts
              </Text>
              {feedback.promptSuggestions.map((item) => (
                <Text key={item} style={[styles.item, { color: theme.colors.textSecondary }]}>
                  - {item}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  privacyRow: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  privacyCopy: { flex: 1, gap: spacing.xs },
  privacyTitle: { fontSize: 14, fontWeight: '600' },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
  },
  helper: { fontSize: 12, lineHeight: 18 },
  presetWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  presetChip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    maxWidth: '100%',
  },
  presetText: { fontSize: 12, lineHeight: 18 },
  error: { fontSize: 12, lineHeight: 18 },
  resultCard: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#F8FAFC',
  },
  summary: { fontSize: 14, lineHeight: 21, fontWeight: '600' },
  listBlock: { gap: spacing.xs },
  listTitle: { fontSize: 13, fontWeight: '600' },
  item: { fontSize: 13, lineHeight: 20 },
});
