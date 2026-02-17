import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { AIFeedbackCard } from '../../components/ai/AIFeedbackCard';
import { moduleColors, useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import {
  addIfThenPlan,
  addImpulseLog,
  loadImpulseState,
  type ImpulseState,
} from '../../lib/impulse';

function formatMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ImpulseScreen() {
  const theme = useTheme();
  const colors = moduleColors.impulse;
  const [state, setState] = useState<ImpulseState | null>(null);
  const [pauseMinutesInput, setPauseMinutesInput] = useState('2');
  const [pauseSecondsLeft, setPauseSecondsLeft] = useState(120);
  const [isRunning, setIsRunning] = useState(false);

  const [planTrigger, setPlanTrigger] = useState('');
  const [planResponse, setPlanResponse] = useState('');
  const [logTrigger, setLogTrigger] = useState('');
  const [logUrge, setLogUrge] = useState('');
  const [logDecision, setLogDecision] = useState('');
  const [logReflection, setLogReflection] = useState('');
  const [statusMessage, setStatusMessage] = useState('Pause first. Decide second.');

  useEffect(() => {
    loadImpulseState().then(setState).catch(() => setStatusMessage('Unable to load impulse tools.'));
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setPauseSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false);
          setStatusMessage('Pause complete. Re-check your intention now.');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartPause = () => {
    const minutes = Math.max(1, Math.min(15, Math.round(Number(pauseMinutesInput) || 2)));
    setPauseMinutesInput(`${minutes}`);
    setPauseSecondsLeft(minutes * 60);
    setIsRunning(true);
  };

  const handleSavePlan = async () => {
    if (!planTrigger.trim() || !planResponse.trim()) {
      setStatusMessage('Add both trigger and response.');
      return;
    }
    const next = await addIfThenPlan({ trigger: planTrigger.trim(), responsePlan: planResponse.trim() });
    setState(next);
    setPlanTrigger('');
    setPlanResponse('');
    setStatusMessage('If-then plan saved.');
  };

  const handleSaveLog = async () => {
    if (!logTrigger.trim() || !logUrge.trim() || !logDecision.trim()) {
      setStatusMessage('Capture trigger, urge, and decision.');
      return;
    }
    const minutes = Math.max(1, Math.round(Number(pauseMinutesInput) || 2));
    const next = await addImpulseLog({
      trigger: logTrigger.trim(),
      urge: logUrge.trim(),
      pauseMinutes: minutes,
      decision: logDecision.trim(),
      reflection: logReflection.trim() || 'No reflection added.',
    });
    setState(next);
    setLogTrigger('');
    setLogUrge('');
    setLogDecision('');
    setLogReflection('');
    setStatusMessage('Impulse log saved.');
  };

  return (
    <SafeAreaWrapper>
      <Header title="Pause & Reflect" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create a pause buffer</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Build automatic pause habits with timers, if-then scripts, and reflection logs.
          </Text>
          <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>{statusMessage}</Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pause Timer</Text>
          <TextInput
            label="Pause minutes"
            value={pauseMinutesInput}
            onChangeText={setPauseMinutesInput}
            keyboardType="number-pad"
            placeholder="2"
          />
          <Text style={[styles.timer, { color: theme.colors.text }]}>{formatMMSS(pauseSecondsLeft)}</Text>
          <View style={styles.row}>
            <Button title="Start Pause" onPress={handleStartPause} variant="primary" size="md" fullWidth style={styles.flex} />
            <Button
              title="Reset"
              onPress={() => {
                setIsRunning(false);
                setPauseSecondsLeft((Math.round(Number(pauseMinutesInput) || 2) || 2) * 60);
              }}
              variant="ghost"
              size="md"
              fullWidth
              style={styles.flex}
            />
          </View>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>If-Then Prompts</Text>
          <TextInput
            label="If trigger"
            value={planTrigger}
            onChangeText={setPlanTrigger}
            placeholder="If I want to send an angry message..."
          />
          <TextInput
            label="Then response"
            value={planResponse}
            onChangeText={setPlanResponse}
            placeholder="...then I wait 10 minutes and rewrite calmly."
          />
          <Button title="Save If-Then" onPress={handleSavePlan} variant="outline" size="md" fullWidth />
          {(state?.plans ?? []).slice(0, 4).map((item) => (
            <Text key={item.id} style={[styles.body, { color: theme.colors.textSecondary }]}>
              If {item.trigger}, then {item.responsePlan}
            </Text>
          ))}
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Trigger Reflection Log</Text>
          <TextInput label="Trigger" value={logTrigger} onChangeText={setLogTrigger} />
          <TextInput label="Urge" value={logUrge} onChangeText={setLogUrge} />
          <TextInput label="Decision made" value={logDecision} onChangeText={setLogDecision} />
          <TextInput label="Reflection" value={logReflection} onChangeText={setLogReflection} />
          <Button title="Save Reflection" onPress={handleSaveLog} variant="outline" size="md" fullWidth />
        </Card>

        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Logs</Text>
          {(state?.logs ?? []).slice(0, 4).map((log) => (
            <View key={log.id} style={styles.section}>
              <Text style={[styles.body, { color: theme.colors.text }]}>
                Trigger: {log.trigger} | Decision: {log.decision}
              </Text>
              <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>
                Pause: {log.pauseMinutes} min • {log.reflection}
              </Text>
            </View>
          ))}
        </Card>

        <AIFeedbackCard
          toolName="Pause & Reflect"
          contextSummary={`If-then plans: ${state?.plans.length ?? 0}. Impulse logs: ${state?.logs.length ?? 0}. Pause timer minutes: ${pauseMinutesInput}. Status: ${statusMessage}.`}
          presetPrompts={[
            'Generate stronger if-then responses for common triggers.',
            'Help me design a 90-second urge surfing routine.',
            'Suggest reflection questions after an impulse event.',
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
  timer: { fontSize: 40, fontWeight: '700', textAlign: 'center' },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
