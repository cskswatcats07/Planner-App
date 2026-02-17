import {
  createStoredEntity,
  readStoredState,
  writeStoredState,
  type StoredEntity,
} from './module-storage';

const STORAGE_KEY = '@mindpilot/dopamine_state';

export type EnergyMode = 'low' | 'medium' | 'high';

export interface ActivationLog extends StoredEntity {
  prompt: string;
}

export interface DopamineState {
  energyMode: EnergyMode;
  currentStreak: number;
  bestStreak: number;
  lastActivationDate: string | null;
  logs: ActivationLog[];
}

const FALLBACK: DopamineState = {
  energyMode: 'medium',
  currentStreak: 0,
  bestStreak: 0,
  lastActivationDate: null,
  logs: [],
};

export const ACTIVATION_PROMPTS = {
  low: [
    'Do one 60-second tidy reset.',
    'Drink a glass of water and stand up.',
    'Open your most important task and do one sentence.',
  ],
  medium: [
    'Set a 10-minute sprint and start imperfectly.',
    'Write the first step for your next task.',
    'Clear one small blocker right now.',
  ],
  high: [
    'Start a 25-minute deep focus sprint.',
    'Tackle the hardest task first for 15 minutes.',
    'Batch 3 pending tasks in one focused block.',
  ],
} as const;

export async function loadDopamineState(): Promise<DopamineState> {
  return readStoredState<DopamineState>(STORAGE_KEY, FALLBACK);
}

async function saveDopamineState(state: DopamineState): Promise<void> {
  await writeStoredState(STORAGE_KEY, state);
}

export async function setEnergyMode(mode: EnergyMode): Promise<DopamineState> {
  const state = await loadDopamineState();
  const next = { ...state, energyMode: mode };
  await saveDopamineState(next);
  return next;
}

function isYesterday(lastIso: string): boolean {
  const last = new Date(lastIso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return (
    last.getFullYear() === yesterday.getFullYear() &&
    last.getMonth() === yesterday.getMonth() &&
    last.getDate() === yesterday.getDate()
  );
}

function isToday(lastIso: string): boolean {
  const last = new Date(lastIso);
  const now = new Date();
  return (
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate()
  );
}

export async function logActivation(prompt: string): Promise<DopamineState> {
  const state = await loadDopamineState();
  const todayIso = new Date().toISOString();

  let nextStreak = state.currentStreak;
  if (!state.lastActivationDate) {
    nextStreak = 1;
  } else if (isToday(state.lastActivationDate)) {
    nextStreak = state.currentStreak;
  } else if (isYesterday(state.lastActivationDate)) {
    nextStreak = state.currentStreak + 1;
  } else {
    nextStreak = 1;
  }

  const next: DopamineState = {
    ...state,
    currentStreak: nextStreak,
    bestStreak: Math.max(state.bestStreak, nextStreak),
    lastActivationDate: todayIso,
    logs: [createStoredEntity({ prompt }), ...state.logs].slice(0, 60),
  };
  await saveDopamineState(next);
  return next;
}
