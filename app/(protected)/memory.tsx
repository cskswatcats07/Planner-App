import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { AIFeedbackCard } from '../../components/ai/AIFeedbackCard';
import { moduleColors, useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import {
  addCapture,
  addReminder,
  loadMemoryState,
  toggleCaptureResolved,
  toggleReminderDone,
  type MemoryState,
} from '../../lib/memory';
import { ensureNotificationPermission, getNotificationPermissionState } from '../../lib/notifications';
import { useToolStore } from '../../store/toolStore';

function toLocalDatetimeInputValue(date: Date): string {
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function MemoryScreen() {
  const theme = useTheme();
  const colors = moduleColors.memory;
  const { markUsed } = useToolStore();
  const [state, setState] = useState<MemoryState | null>(null);
  const [captureInput, setCaptureInput] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [reminderAtInput, setReminderAtInput] = useState(() =>
    toLocalDatetimeInputValue(new Date(Date.now() + 60 * 60 * 1000))
  );
  const [statusMessage, setStatusMessage] = useState('Capture now, organize calmly later.');
  const [notificationHint, setNotificationHint] = useState(
    'Enable notifications to receive reminder nudges.'
  );

  useEffect(() => {
    loadMemoryState()
      .then(setState)
      .catch(() => setStatusMessage('Unable to load memory data.'));

    getNotificationPermissionState()
      .then((stateName) => {
        if (stateName === 'granted') {
          setNotificationHint('Notifications are enabled for reminder cards.');
        } else if (stateName === 'unsupported') {
          setNotificationHint('On web, reminders stay in-app. Push requires iOS/Android.');
        } else {
          setNotificationHint('Enable notifications to receive reminder nudges.');
        }
      })
      .catch(() => {
        // keep default hint
      });
  }, []);

  useEffect(() => {
    markUsed('memory');
  }, [markUsed]);

  const unresolvedCount = useMemo(
    () => (state?.captures ?? []).filter((item) => !item.isResolved).length,
    [state?.captures]
  );
  const upcomingReminders = useMemo(
    () =>
      (state?.reminders ?? [])
        .filter((item) => !item.isDone)
        .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime())
        .slice(0, 4),
    [state?.reminders]
  );

  const handleAddCapture = async () => {
    if (!captureInput.trim()) {
      setStatusMessage('Add a quick note first.');
      return;
    }
    const next = await addCapture(captureInput);
    setState(next);
    setCaptureInput('');
    setStatusMessage('Captured to inbox.');
  };

  const handleAddReminder = async () => {
    const date = new Date(reminderAtInput);
    if (!reminderText.trim() || Number.isNaN(date.getTime())) {
      setStatusMessage('Add reminder text and valid time.');
      return;
    }
    const permissionGranted = await ensureNotificationPermission();
    const next = await addReminder({ text: reminderText, remindAt: date.toISOString() });
    setState(next);
    setReminderText('');
    if (permissionGranted) {
      setStatusMessage('Reminder saved with notifications enabled.');
    } else {
      setStatusMessage('Reminder saved. Enable notifications to get reminder alerts.');
    }
  };

  const handleToggleCapture = async (id: string) => {
    const next = await toggleCaptureResolved(id);
    setState(next);
  };

  const handleToggleReminder = async (id: string) => {
    const next = await toggleReminderDone(id);
    setState(next);
  };

  return (
    <SafeAreaWrapper>
      <Header title="Remember Well" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Memory support, not pressure</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Keep a quick capture inbox, set timed reminders, and close loops one card at a time.
          </Text>
          <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>{statusMessage}</Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Capture Inbox</Text>
          <TextInput
            label="Capture"
            value={captureInput}
            onChangeText={setCaptureInput}
            placeholder="Pick up prescription after work"
          />
          <Button title="Save Capture" onPress={handleAddCapture} variant="primary" size="md" fullWidth />

          {(state?.captures ?? []).slice(0, 6).map((item) => (
            <TouchableOpacity key={item.id} onPress={() => handleToggleCapture(item.id)} style={styles.row}>
              <Ionicons
                name={item.isResolved ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={item.isResolved ? colors.main : theme.colors.textTertiary}
              />
              <Text
                style={[
                  styles.body,
                  {
                    color: theme.colors.text,
                    textDecorationLine: item.isResolved ? 'line-through' : 'none',
                  },
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Scheduled Reminders</Text>
          <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>{notificationHint}</Text>
          <TextInput
            label="Reminder text"
            value={reminderText}
            onChangeText={setReminderText}
            placeholder="Send project update"
          />
          <TextInput
            label="Remind at"
            value={reminderAtInput}
            onChangeText={setReminderAtInput}
            placeholder="2026-03-01T09:00"
          />
          <Button title="Add Reminder" onPress={handleAddReminder} variant="outline" size="md" fullWidth />

          {upcomingReminders.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => handleToggleReminder(item.id)} style={styles.row}>
              <Ionicons
                name={item.isDone ? 'checkmark-circle' : 'alarm-outline'}
                size={20}
                color={item.isDone ? colors.main : theme.colors.textTertiary}
              />
              <View style={styles.wrap}>
                <Text style={[styles.body, { color: theme.colors.text }]}>{item.text}</Text>
                <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>
                  {new Date(item.remindAt).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Daily Recap</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            You have {unresolvedCount} unresolved capture{unresolvedCount === 1 ? '' : 's'}.
            Pick one now to close the loop.
          </Text>
          <Button
            title="Resolve One Item"
            onPress={() => setStatusMessage('Nice. One closed loop creates momentum.')}
            variant="ghost"
            size="md"
            fullWidth
          />
        </Card>

        <AIFeedbackCard
          toolName="Remember Well"
          contextSummary={`Capture count: ${state?.captures.length ?? 0}. Unresolved captures: ${unresolvedCount}. Reminder count: ${state?.reminders.length ?? 0}. Upcoming reminders: ${upcomingReminders.length}. Status: ${statusMessage}.`}
          presetPrompts={[
            'Help me prioritize unresolved captures for today.',
            'Suggest reminder times that reduce missed follow-ups.',
            'Create a short evening memory reset routine.',
          ]}
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
  section: { gap: spacing.md },
  title: { fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 21, flex: 1 },
  caption: { fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wrap: { flex: 1 },
});
