import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  createStoredEntity,
  readStoredState,
  writeStoredState,
  type StoredEntity,
} from './module-storage';

const STORAGE_KEY = '@mindpilot/memory_state';

export interface MemoryCapture extends StoredEntity {
  text: string;
  isResolved: boolean;
}

export interface MemoryReminder extends StoredEntity {
  text: string;
  remindAt: string;
  isDone: boolean;
  notificationId: string | null;
}

export interface MemoryState {
  captures: MemoryCapture[];
  reminders: MemoryReminder[];
}

const FALLBACK_STATE: MemoryState = {
  captures: [],
  reminders: [],
};

export async function loadMemoryState(): Promise<MemoryState> {
  return readStoredState<MemoryState>(STORAGE_KEY, FALLBACK_STATE);
}

async function saveMemoryState(state: MemoryState): Promise<void> {
  await writeStoredState(STORAGE_KEY, state);
}

export async function addCapture(text: string): Promise<MemoryState> {
  const state = await loadMemoryState();
  const capture = createStoredEntity({
    text: text.trim(),
    isResolved: false,
  });
  const next: MemoryState = {
    ...state,
    captures: [capture, ...state.captures].slice(0, 150),
  };
  await saveMemoryState(next);
  return next;
}

export async function toggleCaptureResolved(id: string): Promise<MemoryState> {
  const state = await loadMemoryState();
  const next: MemoryState = {
    ...state,
    captures: state.captures.map((capture) =>
      capture.id === id
        ? { ...capture, isResolved: !capture.isResolved, updatedAt: new Date().toISOString() }
        : capture
    ),
  };
  await saveMemoryState(next);
  return next;
}

async function scheduleReminderNotification(
  text: string,
  remindAtIso: string
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const remindAt = new Date(remindAtIso);
  if (Number.isNaN(remindAt.getTime()) || remindAt.getTime() <= Date.now()) {
    return null;
  }
  const permission = await Notifications.getPermissionsAsync();
  const granted = permission.granted
    ? true
    : (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Memory Reminder',
      body: text,
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: remindAt,
    },
  });
}

export async function addReminder(input: {
  text: string;
  remindAt: string;
}): Promise<MemoryState> {
  const state = await loadMemoryState();
  const notificationId = await scheduleReminderNotification(input.text.trim(), input.remindAt);
  const reminder = createStoredEntity({
    text: input.text.trim(),
    remindAt: input.remindAt,
    isDone: false,
    notificationId,
  });
  const next: MemoryState = {
    ...state,
    reminders: [reminder, ...state.reminders].slice(0, 120),
  };
  await saveMemoryState(next);
  return next;
}

export async function toggleReminderDone(id: string): Promise<MemoryState> {
  const state = await loadMemoryState();
  const next: MemoryState = {
    ...state,
    reminders: state.reminders.map((reminder) =>
      reminder.id === id
        ? { ...reminder, isDone: !reminder.isDone, updatedAt: new Date().toISOString() }
        : reminder
    ),
  };
  await saveMemoryState(next);
  return next;
}
