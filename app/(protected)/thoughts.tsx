import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { AIFeedbackCard } from '../../components/ai/AIFeedbackCard';
import { moduleColors, useTheme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import {
  addReflection,
  addThought,
  loadThoughtsState,
  type ThoughtTag,
  type ThoughtsState,
} from '../../lib/thoughts';
import { useToolStore } from '../../store/toolStore';

const TAGS: ThoughtTag[] = ['action', 'worry', 'idea', 'later'];

export default function ThoughtsScreen() {
  const theme = useTheme();
  const colors = moduleColors.thoughts;
  const { markUsed } = useToolStore();
  const [state, setState] = useState<ThoughtsState | null>(null);
  const [thoughtInput, setThoughtInput] = useState('');
  const [tag, setTag] = useState<ThoughtTag>('action');
  const [release, setRelease] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [statusMessage, setStatusMessage] = useState('Name the thought. Then place it gently.');

  useEffect(() => {
    loadThoughtsState().then(setState).catch(() => setStatusMessage('Unable to load thought tools.'));
  }, []);

  useEffect(() => {
    markUsed('thoughts');
  }, [markUsed]);

  const handleAddThought = async () => {
    if (!thoughtInput.trim()) {
      setStatusMessage('Write one thought first.');
      return;
    }
    const next = await addThought({ text: thoughtInput, tag });
    setState(next);
    setThoughtInput('');
    setStatusMessage('Thought captured and sorted.');
  };

  const handleSaveReflection = async () => {
    if (!release.trim() || !gratitude.trim() || !nextStep.trim()) {
      setStatusMessage('Complete all three reflection prompts.');
      return;
    }
    const next = await addReflection({ release, gratitude, nextStep });
    setState(next);
    setRelease('');
    setGratitude('');
    setNextStep('');
    setStatusMessage('Reflection saved.');
  };

  return (
    <SafeAreaWrapper>
      <Header title="Thought Organizer" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>From noise to clarity</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Capture thoughts quickly, sort by type, and end the day with a calm reset.
          </Text>
          <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>{statusMessage}</Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Brain Dump + Sort</Text>
          <TextInput
            label="Thought"
            value={thoughtInput}
            onChangeText={setThoughtInput}
            placeholder="I forgot to send that invoice."
          />
          <View style={styles.row}>
            {TAGS.map((item) => {
              const selected = tag === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setTag(item)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.light : theme.colors.surface,
                      borderColor: selected ? colors.main : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: theme.colors.text }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Button title="Save Thought" onPress={handleAddThought} variant="primary" size="md" fullWidth />
          {(state?.entries ?? []).slice(0, 6).map((entry) => (
            <View key={entry.id} style={styles.entryRow}>
              <Text style={[styles.tag, { color: colors.main }]}>{entry.tag.toUpperCase()}</Text>
              <Text style={[styles.body, { color: theme.colors.text }]}>{entry.text}</Text>
            </View>
          ))}
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Wind-down Reflection</Text>
          <TextInput
            label="What can I release?"
            value={release}
            onChangeText={setRelease}
            placeholder="I can stop replaying that awkward moment."
          />
          <TextInput
            label="One gratitude"
            value={gratitude}
            onChangeText={setGratitude}
            placeholder="A teammate helped me untangle a blocker."
          />
          <TextInput
            label="Next tiny step"
            value={nextStep}
            onChangeText={setNextStep}
            placeholder="Draft tomorrow's top priority in 2 lines."
          />
          <Button title="Save Reflection" onPress={handleSaveReflection} variant="outline" size="md" fullWidth />
        </Card>

        <AIFeedbackCard
          toolName="Thought Organizer"
          contextSummary={`Thought entries: ${state?.entries.length ?? 0}. Reflection entries: ${state?.reflections.length ?? 0}. Current status: ${statusMessage}. Current selected tag: ${tag}.`}
          presetPrompts={[
            'Help me reframe my top worries into actionable next steps.',
            'Give me a calming wind-down reflection script.',
            'Sort these thought patterns into action vs later buckets.',
          ]}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.base, gap: spacing.lg, paddingBottom: spacing['3xl'] },
  section: { gap: spacing.md },
  title: { fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 21, flex: 1 },
  caption: { fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  entryRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  tag: { fontSize: 11, fontWeight: '700', width: 62 },
});
