import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AIFeedbackCard } from '../../components/ai/AIFeedbackCard';
import { moduleColors, useTheme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import {
  TIME_PURPOSE_PRESETS,
  cancelTimerNotifications,
  loadTimeReminderConfig,
  requestNotificationPermission,
  sanitizeMinutes,
  saveTimeReminderConfig,
  scheduleTimerNotifications,
  type ScheduledTimerNotifications,
} from '../../lib/time-awareness';
import { getAvailableWearableBridges } from '../../lib/wearables';
import {
  addTimeEstimationEntry,
  loadTimeEstimationHistory,
  summarizeTimeEstimation,
  type TimeEstimationEntry,
} from '../../lib/time-estimation';
import {
  ensureNotificationPermission,
  getNotificationPermissionState,
  openAppSettings,
  type NotificationPermissionState,
} from '../../lib/notifications';

const DEFAULT_DURATION_MINUTES = 25;
const DEFAULT_NUDGE_MINUTES = 5;
const MAX_ACTIVITY_LOG_ITEMS = 4;
const MAX_ESTIMATION_ITEMS = 5;

function formatMMSS(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutesPart = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secondsPart = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutesPart}:${secondsPart}`;
}

export default function TimeBlindnessScreen() {
  const theme = useTheme();
  const timeColors = moduleColors.timeBlindness;

  const [selectedPurposeId, setSelectedPurposeId] = useState<
    (typeof TIME_PURPOSE_PRESETS)[number]['id']
  >(TIME_PURPOSE_PRESETS[0].id);
  const [durationInput, setDurationInput] = useState(`${DEFAULT_DURATION_MINUTES}`);
  const [nudgeInput, setNudgeInput] = useState(`${DEFAULT_NUDGE_MINUTES}`);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [watchEnabled, setWatchEnabled] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [lastNudgeElapsedSeconds, setLastNudgeElapsedSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    'Choose a purpose and start your countdown.'
  );
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [scheduledNotifications, setScheduledNotifications] =
    useState<ScheduledTimerNotifications>({
      repeatingNudgeId: null,
      completionId: null,
    });
  const [estimationTaskName, setEstimationTaskName] = useState('');
  const [estimatedMinutesInput, setEstimatedMinutesInput] = useState('25');
  const [actualMinutesInput, setActualMinutesInput] = useState('');
  const [estimationHistory, setEstimationHistory] = useState<TimeEstimationEntry[]>([]);
  const [estimationMessage, setEstimationMessage] = useState(
    'Log estimate vs actual to calibrate your time sense.'
  );
  const [notificationState, setNotificationState] =
    useState<NotificationPermissionState>('undetermined');

  const selectedPurpose = useMemo(
    () => TIME_PURPOSE_PRESETS.find((preset) => preset.id === selectedPurposeId) ?? TIME_PURPOSE_PRESETS[0],
    [selectedPurposeId]
  );

  const durationMinutes = sanitizeMinutes(
    Number.parseInt(durationInput, 10),
    selectedPurpose.defaultDurationMinutes
  );
  const nudgeEveryMinutes = sanitizeMinutes(
    Number.parseInt(nudgeInput, 10),
    selectedPurpose.defaultNudgeEveryMinutes
  );
  const nudgeEverySeconds = nudgeEveryMinutes * 60;

  const addActivity = useCallback((message: string) => {
    const stampedMessage = `${new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${message}`;

    setActivityLog((current) => [stampedMessage, ...current].slice(0, MAX_ACTIVITY_LOG_ITEMS));
  }, []);

  const mirrorNudgeToWatch = useCallback(async (message: string) => {
    if (!watchEnabled) return;

    const availableBridges = await getAvailableWearableBridges();
    if (availableBridges.length === 0) {
      return;
    }

    await Promise.all(
      availableBridges.map((bridge) =>
        bridge.sendNotification({
          title: 'MindPilot Time Check',
          message,
          scheduledAt: new Date().toISOString(),
        })
      )
    );
  }, [watchEnabled]);

  const applyPurposePreset = useCallback((purposeId: (typeof TIME_PURPOSE_PRESETS)[number]['id']) => {
    const preset = TIME_PURPOSE_PRESETS.find((item) => item.id === purposeId);
    if (!preset) return;

    setSelectedPurposeId(purposeId);
    setDurationInput(`${preset.defaultDurationMinutes}`);
    setNudgeInput(`${preset.defaultNudgeEveryMinutes}`);
  }, []);

  const stopTimer = useCallback(async (reason?: string) => {
    setIsRunning(false);
    setLastNudgeElapsedSeconds(0);

    if (scheduledNotifications.repeatingNudgeId || scheduledNotifications.completionId) {
      await cancelTimerNotifications(scheduledNotifications);
      setScheduledNotifications({ repeatingNudgeId: null, completionId: null });
    }

    if (reason) {
      setStatusMessage(reason);
      addActivity(reason);
    }
  }, [addActivity, scheduledNotifications]);

  const startTimer = useCallback(async () => {
    const normalizedDuration = sanitizeMinutes(durationMinutes, DEFAULT_DURATION_MINUTES);
    const normalizedNudge = sanitizeMinutes(nudgeEveryMinutes, DEFAULT_NUDGE_MINUTES);

    setDurationInput(`${normalizedDuration}`);
    setNudgeInput(`${normalizedNudge}`);
    setSecondsLeft(normalizedDuration * 60);
    setTotalSeconds(normalizedDuration * 60);
    setLastNudgeElapsedSeconds(0);
    setStatusMessage(
      `${selectedPurpose.title} started. You will be nudged every ${normalizedNudge} minute(s).`
    );
    setIsRunning(true);
    setActivityLog([]);
    addActivity(`${selectedPurpose.title} started`);

    await saveTimeReminderConfig({
      purposeId: selectedPurpose.id,
      durationMinutes: normalizedDuration,
      nudgeEveryMinutes: normalizedNudge,
      pushEnabled,
      watchEnabled,
    });

    if (scheduledNotifications.repeatingNudgeId || scheduledNotifications.completionId) {
      await cancelTimerNotifications(scheduledNotifications);
      setScheduledNotifications({ repeatingNudgeId: null, completionId: null });
    }

    if (!pushEnabled) {
      return;
    }

    const notificationsGranted = await requestNotificationPermission();
    setNotificationState(notificationsGranted ? 'granted' : 'denied');
    if (!notificationsGranted) {
      setStatusMessage(
        'Timer started without push permission. In-app nudges remain active.'
      );
      addActivity('Push permission denied');
      return;
    }

    const scheduled = await scheduleTimerNotifications({
      durationMinutes: normalizedDuration,
      nudgeEveryMinutes: normalizedNudge,
      purposeTitle: selectedPurpose.title,
    });

    setScheduledNotifications(scheduled);
    addActivity('Push nudges scheduled');
  }, [
    addActivity,
    durationMinutes,
    nudgeEveryMinutes,
    pushEnabled,
    scheduledNotifications,
    selectedPurpose,
    watchEnabled,
  ]);

  useEffect(() => {
    loadTimeEstimationHistory()
      .then((history) => setEstimationHistory(history))
      .catch(() => {
        // Keep empty state if history load fails.
      });
  }, []);

  useEffect(() => {
    getNotificationPermissionState()
      .then(setNotificationState)
      .catch(() => setNotificationState('undetermined'));
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        setSecondsLeft((current) => {
          if (current <= 1) {
            setStatusMessage('Session complete. Nice intentional time block.');
            setIsRunning(false);
            addActivity('Session completed');
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [addActivity, isRunning]);

  useEffect(() => {
    if (!isRunning || totalSeconds <= 0 || nudgeEverySeconds <= 0) {
      return;
    }

    const elapsedSeconds = totalSeconds - secondsLeft;
    const shouldNudge =
      elapsedSeconds > 0 &&
      elapsedSeconds < totalSeconds &&
      elapsedSeconds % nudgeEverySeconds === 0 &&
      elapsedSeconds !== lastNudgeElapsedSeconds;

    if (!shouldNudge) {
      return;
    }

    setLastNudgeElapsedSeconds(elapsedSeconds);
    const nudgeMessage = `${selectedPurpose.title}: ${formatMMSS(
      secondsLeft
    )} remaining. Quick check-in.`;
    setStatusMessage(nudgeMessage);
    addActivity(`Nudge sent (${Math.floor(elapsedSeconds / 60)} min mark)`);

    mirrorNudgeToWatch(nudgeMessage).catch(() => {
      addActivity('Watch nudge unavailable');
    });
  }, [
    addActivity,
    isRunning,
    lastNudgeElapsedSeconds,
    mirrorNudgeToWatch,
    nudgeEverySeconds,
    secondsLeft,
    selectedPurpose.title,
    totalSeconds,
  ]);

  useEffect(() => {
    loadTimeReminderConfig()
      .then((config) => {
        if (!config) return;
        applyPurposePreset(config.purposeId);
        setDurationInput(`${sanitizeMinutes(config.durationMinutes, DEFAULT_DURATION_MINUTES)}`);
        setNudgeInput(`${sanitizeMinutes(config.nudgeEveryMinutes, DEFAULT_NUDGE_MINUTES)}`);
        setPushEnabled(config.pushEnabled);
        setWatchEnabled(config.watchEnabled);
      })
      .catch(() => {
        // Keep defaults if local load fails.
      });
  }, [applyPurposePreset]);

  useEffect(() => {
    if (!isRunning && (scheduledNotifications.repeatingNudgeId || scheduledNotifications.completionId)) {
      cancelTimerNotifications(scheduledNotifications)
        .then(() => setScheduledNotifications({ repeatingNudgeId: null, completionId: null }))
        .catch(() => {
          // No-op: local notifications cleanup is best-effort.
        });
    }
  }, [isRunning, scheduledNotifications]);

  const handleSaveEstimation = useCallback(async () => {
    const taskName = estimationTaskName.trim();
    if (!taskName) {
      setEstimationMessage('Add a task name before saving.');
      return;
    }

    const estimatedMinutes = sanitizeMinutes(
      Number.parseInt(estimatedMinutesInput, 10),
      25
    );
    const actualMinutes = sanitizeMinutes(
      Number.parseInt(actualMinutesInput, 10),
      estimatedMinutes
    );

    setEstimatedMinutesInput(`${estimatedMinutes}`);
    setActualMinutesInput(`${actualMinutes}`);

    const updated = await addTimeEstimationEntry({
      taskName,
      estimatedMinutes,
      actualMinutes,
    });

    setEstimationHistory(updated);
    setEstimationTaskName('');

    const delta = actualMinutes - estimatedMinutes;
    if (delta > 0) {
      setEstimationMessage(`Saved. This task took ${delta} min longer than estimated.`);
    } else if (delta < 0) {
      setEstimationMessage(`Saved. You finished ${Math.abs(delta)} min faster than estimated.`);
    } else {
      setEstimationMessage('Saved. Perfect estimate.');
    }
  }, [actualMinutesInput, estimatedMinutesInput, estimationTaskName]);

  const elapsedProgress =
    totalSeconds > 0 ? Math.min(1, Math.max(0, (totalSeconds - secondsLeft) / totalSeconds)) : 0;
  const nextNudgeSeconds =
    isRunning && nudgeEverySeconds > 0
      ? nudgeEverySeconds - ((totalSeconds - secondsLeft) % nudgeEverySeconds || nudgeEverySeconds)
      : 0;
  const estimationSummary = summarizeTimeEstimation(estimationHistory);

  return (
    <SafeAreaWrapper>
      <Header title="Time Awareness" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.heroCard}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Visual Countdown</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Set a focused time block and receive gentle nudges every X minutes. This first
            version supports push reminders and watch mirroring hooks.
          </Text>
          <Text style={[styles.note, { color: theme.colors.textTertiary }]}>
            Doom Scrolling mode currently uses a manual timer while your screen is on.
            Automatic screen-time detection can be added in a later device-integrated release.
          </Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Notification Access
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            {notificationState === 'granted'
              ? 'Push nudges are enabled for background reminders.'
              : notificationState === 'unsupported'
              ? 'Push nudges are unavailable on web. In-app nudges still work.'
              : 'Enable notifications for reliable nudges when the app is in background.'}
          </Text>
          {notificationState !== 'granted' && notificationState !== 'unsupported' ? (
            <View style={styles.row}>
              <Button
                title="Enable Notifications"
                onPress={async () => {
                  const granted = await ensureNotificationPermission();
                  setNotificationState(granted ? 'granted' : 'denied');
                }}
                variant="outline"
                size="md"
                fullWidth
                style={styles.halfField}
              />
              <Button
                title="Open Settings"
                onPress={openAppSettings}
                variant="ghost"
                size="md"
                fullWidth
                style={styles.halfField}
              />
            </View>
          ) : null}
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Purpose</Text>
          <View style={styles.purposeGrid}>
            {TIME_PURPOSE_PRESETS.map((preset) => {
              const selected = preset.id === selectedPurposeId;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.purposeCard,
                    {
                      backgroundColor: selected ? timeColors.light : theme.colors.card,
                      borderColor: selected ? timeColors.main : theme.colors.border,
                    },
                  ]}
                  onPress={() => applyPurposePreset(preset.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${preset.title}`}
                >
                  <Text style={[styles.purposeTitle, { color: theme.colors.text }]}>
                    {preset.title}
                  </Text>
                  <Text style={[styles.purposeBody, { color: theme.colors.textSecondary }]}>
                    {preset.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Timer Setup</Text>
          <View style={styles.row}>
            <TextInput
              label="Duration (minutes)"
              value={durationInput}
              onChangeText={setDurationInput}
              keyboardType="number-pad"
              containerStyle={styles.halfField}
            />
            <TextInput
              label="Nudge Every (minutes)"
              value={nudgeInput}
              onChangeText={setNudgeInput}
              keyboardType="number-pad"
              containerStyle={styles.halfField}
            />
          </View>

          <ToggleRow
            label="Push reminders"
            description="Send local push nudges while timer runs."
            enabled={pushEnabled}
            onToggle={() => setPushEnabled((current) => !current)}
            color={timeColors.main}
          />
          <ToggleRow
            label="Mirror nudges to watch"
            description="Uses wearable bridge hooks when a watch integration is available."
            enabled={watchEnabled}
            onToggle={() => setWatchEnabled((current) => !current)}
            color={timeColors.main}
          />
        </Card>

        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Active Session</Text>
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, { color: theme.colors.text }]}>
              {formatMMSS(secondsLeft)}
            </Text>
            <Text style={[styles.timerSubtext, { color: theme.colors.textSecondary }]}>
              {isRunning
                ? `${selectedPurpose.title} running`
                : `Ready: ${durationMinutes} min session`}
            </Text>
          </View>
          <ProgressBar progress={elapsedProgress} color={timeColors.main} height={10} />
          <Text style={[styles.status, { color: theme.colors.textSecondary }]}>{statusMessage}</Text>
          {isRunning ? (
            <Text style={[styles.statusNote, { color: theme.colors.textTertiary }]}>
              Next nudge in about {Math.ceil(nextNudgeSeconds / 60)} minute(s).
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button
              title={isRunning ? 'Restart Timer' : 'Start Timer'}
              onPress={startTimer}
              variant="primary"
              size="md"
              fullWidth
            />
            <Button
              title="Stop"
              onPress={() => stopTimer('Session stopped')}
              variant="ghost"
              size="md"
              fullWidth
              disabled={!isRunning && secondsLeft === 0}
            />
          </View>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
          {activityLog.length === 0 ? (
            <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
              No activity yet. Start a timer to see nudges and session milestones.
            </Text>
          ) : (
            activityLog.map((line) => (
              <View key={line} style={styles.activityRow}>
                <Ionicons name="ellipse" size={10} color={timeColors.main} />
                <Text style={[styles.activityText, { color: theme.colors.textSecondary }]}>{line}</Text>
              </View>
            ))
          )}
        </Card>

        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Time Estimation Practice
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Capture estimate vs actual to train better duration awareness.
          </Text>
          <TextInput
            label="Task"
            value={estimationTaskName}
            onChangeText={setEstimationTaskName}
            placeholder="Example: Draft project update"
          />
          <View style={styles.row}>
            <TextInput
              label="Estimated (min)"
              value={estimatedMinutesInput}
              onChangeText={setEstimatedMinutesInput}
              keyboardType="number-pad"
              containerStyle={styles.halfField}
            />
            <TextInput
              label="Actual (min)"
              value={actualMinutesInput}
              onChangeText={setActualMinutesInput}
              keyboardType="number-pad"
              containerStyle={styles.halfField}
            />
          </View>
          <Button
            title="Save Comparison"
            onPress={handleSaveEstimation}
            variant="primary"
            size="md"
            fullWidth
          />
          <Text style={[styles.status, { color: theme.colors.textSecondary }]}>
            {estimationMessage}
          </Text>

          {estimationSummary.sampleSize > 0 ? (
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
                Calibration trend ({estimationSummary.sampleSize} sample
                {estimationSummary.sampleSize > 1 ? 's' : ''})
              </Text>
              <Text style={[styles.summaryItem, { color: theme.colors.textSecondary }]}>
                Average absolute error: {estimationSummary.averageAbsoluteErrorMinutes.toFixed(1)} min
              </Text>
              <Text style={[styles.summaryItem, { color: theme.colors.textSecondary }]}>
                Bias:{' '}
                {estimationSummary.averageSignedDeltaMinutes > 0
                  ? `typically ${estimationSummary.averageSignedDeltaMinutes.toFixed(1)} min underestimation`
                  : estimationSummary.averageSignedDeltaMinutes < 0
                  ? `typically ${Math.abs(
                      estimationSummary.averageSignedDeltaMinutes
                    ).toFixed(1)} min overestimation`
                  : 'on target'}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>Recent comparisons</Text>
            {estimationHistory.length === 0 ? (
              <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
                No entries yet. Log your first estimate above.
              </Text>
            ) : (
              estimationHistory.slice(0, MAX_ESTIMATION_ITEMS).map((item) => (
                <View key={item.id} style={styles.estimationRow}>
                  <View style={styles.estimationTextWrap}>
                    <Text style={[styles.estimationTask, { color: theme.colors.text }]}>
                      {item.taskName}
                    </Text>
                    <Text style={[styles.estimationMeta, { color: theme.colors.textSecondary }]}>
                      Est {item.estimatedMinutes} min • Actual {item.actualMinutes} min
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.deltaChip,
                      {
                        color: item.deltaMinutes > 0 ? '#B45309' : '#065F46',
                        backgroundColor: item.deltaMinutes > 0 ? '#FDE68A' : '#A7F3D0',
                      },
                    ]}
                  >
                    {item.deltaMinutes > 0 ? `+${item.deltaMinutes}` : item.deltaMinutes}m
                  </Text>
                </View>
              ))
            )}
          </View>
        </Card>

        <AIFeedbackCard
          toolName="Time Awareness"
          contextSummary={`Purpose: ${selectedPurpose.title}. Duration: ${durationMinutes} min. Nudge every: ${nudgeEveryMinutes} min. Status: ${statusMessage}. Estimation entries: ${estimationHistory.length}.`}
          presetPrompts={[
            'Help me plan a realistic focus block for today.',
            'Suggest a better nudge interval for my current pattern.',
            'Give me a weekly calibration drill for estimate vs actual.',
          ]}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  color,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  color: string;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.toggleRow, { borderColor: theme.colors.borderLight }]}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
    >
      <View style={styles.toggleText}>
        <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <View
        style={[
          styles.togglePill,
          { backgroundColor: enabled ? color : theme.colors.border },
        ]}
      >
        <Ionicons
          name={enabled ? 'checkmark' : 'remove'}
          size={14}
          color="#FFFFFF"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  heroCard: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  purposeGrid: {
    gap: spacing.sm,
  },
  purposeCard: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  purposeTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  purposeBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  toggleRow: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleText: {
    flex: 1,
    gap: spacing.xs,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  togglePill: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timerText: {
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: -1,
  },
  timerSubtext: {
    fontSize: 14,
  },
  status: {
    fontSize: 13,
    lineHeight: 20,
  },
  statusNote: {
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    gap: spacing.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  summaryBox: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: '#FFF7ED',
    gap: spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryItem: {
    fontSize: 13,
    lineHeight: 20,
  },
  estimationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  estimationTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  estimationTask: {
    fontSize: 14,
    fontWeight: '600',
  },
  estimationMeta: {
    fontSize: 12,
    lineHeight: 18,
  },
  deltaChip: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
});
