import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AIFeedbackCard } from '../../components/ai/AIFeedbackCard';
import { moduleColors, useTheme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import {
  ACTIVATION_PROMPTS,
  loadDopamineState,
  logActivation,
  setEnergyMode,
  type DopamineState,
  type EnergyMode,
} from '../../lib/dopamine';
import { useToolStore } from '../../store/toolStore';

const ENERGY_MODES: EnergyMode[] = ['low', 'medium', 'high'];

function pickPrompt(mode: EnergyMode): string {
  const prompts = ACTIVATION_PROMPTS[mode];
  return prompts[Math.floor(Math.random() * prompts.length)];
}

export default function DopamineScreen() {
  const theme = useTheme();
  const colors = moduleColors.dopamine;
  const { markUsed } = useToolStore();
  const [state, setState] = useState<DopamineState | null>(null);
  const [prompt, setPrompt] = useState('');
  const [statusMessage, setStatusMessage] = useState('Momentum is built in tiny wins.');

  useEffect(() => {
    loadDopamineState()
      .then((loaded) => {
        setState(loaded);
        setPrompt(pickPrompt(loaded.energyMode));
      })
      .catch(() => setStatusMessage('Unable to load motivation data.'));
  }, []);

  useEffect(() => {
    markUsed('dopamine');
  }, [markUsed]);

  const energyMode = state?.energyMode ?? 'medium';
  const energyPlan = useMemo(() => {
    if (energyMode === 'low') return 'Aim for 2-minute actions and zero perfection.';
    if (energyMode === 'high') return 'Protect momentum with one meaningful sprint.';
    return 'Use 10-minute blocks and stack quick wins.';
  }, [energyMode]);

  const handleSetMode = async (mode: EnergyMode) => {
    const next = await setEnergyMode(mode);
    setState(next);
    setPrompt(pickPrompt(mode));
    setStatusMessage(`Energy mode set to ${mode}.`);
  };

  const handleCompletePrompt = async () => {
    if (!prompt) return;
    const next = await logActivation(prompt);
    setState(next);
    setPrompt(pickPrompt(next.energyMode));
    setStatusMessage('Activation logged. Nice forward motion.');
  };

  return (
    <SafeAreaWrapper>
      <Header title="Motivation Boost" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Activation, not pressure</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Pick your energy mode and grab one concrete action to start moving.
          </Text>
          <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>{statusMessage}</Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Energy Mode</Text>
          <View style={styles.row}>
            {ENERGY_MODES.map((mode) => {
              const selected = mode === energyMode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleSetMode(mode)}
                  style={[
                    styles.modeChip,
                    {
                      backgroundColor: selected ? colors.light : theme.colors.surface,
                      borderColor: selected ? colors.main : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.modeText, { color: theme.colors.text }]}>{mode}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{energyPlan}</Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Activation Deck</Text>
          <View style={[styles.promptCard, { borderColor: colors.main }]}>
            <Text style={[styles.promptText, { color: theme.colors.text }]}>{prompt}</Text>
          </View>
          <View style={styles.row}>
            <Button
              title="New Prompt"
              onPress={() => setPrompt(pickPrompt(energyMode))}
              variant="outline"
              size="md"
              fullWidth
              style={styles.flex}
            />
            <Button
              title="I Did This"
              onPress={handleCompletePrompt}
              variant="primary"
              size="md"
              fullWidth
              style={styles.flex}
            />
          </View>
        </Card>

        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Streak</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Current streak: {state?.currentStreak ?? 0} day(s)
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Best streak: {state?.bestStreak ?? 0} day(s)
          </Text>
          {(state?.logs ?? []).slice(0, 4).map((item) => (
            <Text key={item.id} style={[styles.caption, { color: theme.colors.textTertiary }]}>
              - {item.prompt}
            </Text>
          ))}
        </Card>

        <AIFeedbackCard
          toolName="Motivation Boost"
          contextSummary={`Energy mode: ${energyMode}. Current prompt: ${prompt}. Current streak: ${state?.currentStreak ?? 0}. Best streak: ${state?.bestStreak ?? 0}. Status: ${statusMessage}.`}
          presetPrompts={[
            'Give me a low-energy activation plan for 10 minutes.',
            'Suggest streak-safe habits when my schedule breaks.',
            'Create 3 tiny wins I can do right now.',
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
  body: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  modeChip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  modeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  promptCard: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    backgroundColor: '#FDF2F8',
  },
  promptText: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  flex: { flex: 1 },
});
