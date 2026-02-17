import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureNotificationPermission } from './notifications';

export interface TimePurposePreset {
  id: 'focusSprint' | 'deepWork' | 'doomScrollingReset' | 'transitionBuffer';
  title: string;
  description: string;
  defaultDurationMinutes: number;
  defaultNudgeEveryMinutes: number;
}

export interface TimeReminderConfig {
  purposeId: TimePurposePreset['id'];
  durationMinutes: number;
  nudgeEveryMinutes: number;
  pushEnabled: boolean;
  watchEnabled: boolean;
}

export interface ScheduledTimerNotifications {
  repeatingNudgeId: string | null;
  completionId: string | null;
}

const STORAGE_KEY = '@mindpilot/time_reminder_config';

export const TIME_PURPOSE_PRESETS: TimePurposePreset[] = [
  {
    id: 'focusSprint',
    title: 'Focus Sprint',
    description: '25-minute focus with gentle time-check nudges.',
    defaultDurationMinutes: 25,
    defaultNudgeEveryMinutes: 5,
  },
  {
    id: 'deepWork',
    title: 'Deep Work',
    description: 'Longer concentration block with less frequent nudges.',
    defaultDurationMinutes: 50,
    defaultNudgeEveryMinutes: 10,
  },
  {
    id: 'doomScrollingReset',
    title: 'Doom Scrolling Reset',
    description: 'Use while your screen is on to break endless scrolling loops.',
    defaultDurationMinutes: 20,
    defaultNudgeEveryMinutes: 4,
  },
  {
    id: 'transitionBuffer',
    title: 'Transition Buffer',
    description: 'Short check-ins to help you switch tasks intentionally.',
    defaultDurationMinutes: 15,
    defaultNudgeEveryMinutes: 3,
  },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function loadTimeReminderConfig(): Promise<TimeReminderConfig | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TimeReminderConfig;
  } catch {
    return null;
  }
}

export async function saveTimeReminderConfig(config: TimeReminderConfig): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function sanitizeMinutes(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  const rounded = Math.round(value);
  return Math.max(1, Math.min(180, rounded));
}

export async function requestNotificationPermission(): Promise<boolean> {
  return ensureNotificationPermission();
}

export async function scheduleTimerNotifications(options: {
  durationMinutes: number;
  nudgeEveryMinutes: number;
  purposeTitle: string;
}): Promise<ScheduledTimerNotifications> {
  if (Platform.OS === 'web') {
    return { repeatingNudgeId: null, completionId: null };
  }

  const nudgeEverySeconds = options.nudgeEveryMinutes * 60;
  const totalDurationSeconds = options.durationMinutes * 60;

  const repeatingNudgeId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time Check',
      body: `${options.purposeTitle}: take a quick breath and verify your focus.`,
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: nudgeEverySeconds,
      repeats: true,
    },
  });

  const completionId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Countdown Complete',
      body: `${options.purposeTitle} session ended. Decide your next intentional step.`,
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: totalDurationSeconds,
      repeats: false,
    },
  });

  return { repeatingNudgeId, completionId };
}

export async function cancelTimerNotifications(
  scheduled: ScheduledTimerNotifications
): Promise<void> {
  if (Platform.OS === 'web') return;

  const cancellationTasks: Promise<void>[] = [];

  if (scheduled.repeatingNudgeId) {
    cancellationTasks.push(
      Notifications.cancelScheduledNotificationAsync(scheduled.repeatingNudgeId)
    );
  }

  if (scheduled.completionId) {
    cancellationTasks.push(
      Notifications.cancelScheduledNotificationAsync(scheduled.completionId)
    );
  }

  await Promise.all(cancellationTasks);
}
