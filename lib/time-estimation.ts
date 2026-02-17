import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mindpilot/time_estimation_history';
const MAX_ENTRIES = 50;

export interface TimeEstimationEntry {
  id: string;
  taskName: string;
  estimatedMinutes: number;
  actualMinutes: number;
  deltaMinutes: number;
  absoluteErrorMinutes: number;
  createdAt: string;
}

export interface TimeEstimationSummary {
  averageAbsoluteErrorMinutes: number;
  averageSignedDeltaMinutes: number;
  sampleSize: number;
}

export async function loadTimeEstimationHistory(): Promise<TimeEstimationEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as TimeEstimationEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function saveTimeEstimationHistory(history: TimeEstimationEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));
}

export async function addTimeEstimationEntry(input: {
  taskName: string;
  estimatedMinutes: number;
  actualMinutes: number;
}): Promise<TimeEstimationEntry[]> {
  const current = await loadTimeEstimationHistory();
  const deltaMinutes = input.actualMinutes - input.estimatedMinutes;

  const entry: TimeEstimationEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    taskName: input.taskName.trim(),
    estimatedMinutes: input.estimatedMinutes,
    actualMinutes: input.actualMinutes,
    deltaMinutes,
    absoluteErrorMinutes: Math.abs(deltaMinutes),
    createdAt: new Date().toISOString(),
  };

  const updated = [entry, ...current];
  await saveTimeEstimationHistory(updated);
  return updated.slice(0, MAX_ENTRIES);
}

export function summarizeTimeEstimation(history: TimeEstimationEntry[]): TimeEstimationSummary {
  if (history.length === 0) {
    return {
      averageAbsoluteErrorMinutes: 0,
      averageSignedDeltaMinutes: 0,
      sampleSize: 0,
    };
  }

  const totalAbsoluteError = history.reduce(
    (sum, item) => sum + item.absoluteErrorMinutes,
    0
  );
  const totalDelta = history.reduce((sum, item) => sum + item.deltaMinutes, 0);

  return {
    averageAbsoluteErrorMinutes: totalAbsoluteError / history.length,
    averageSignedDeltaMinutes: totalDelta / history.length,
    sampleSize: history.length,
  };
}
