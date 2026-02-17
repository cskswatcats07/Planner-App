import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function createStoredEntity<T extends Record<string, unknown>>(
  input: T
): T & StoredEntity {
  const now = nowIso();
  return {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
}

export async function readStoredState<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeStoredState<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
