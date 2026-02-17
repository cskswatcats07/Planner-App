import {
  createStoredEntity,
  readStoredState,
  writeStoredState,
  type StoredEntity,
} from './module-storage';

const STORAGE_KEY = '@mindpilot/thoughts_state';

export type ThoughtTag = 'action' | 'worry' | 'idea' | 'later';

export interface ThoughtEntry extends StoredEntity {
  text: string;
  tag: ThoughtTag;
}

export interface ReflectionEntry extends StoredEntity {
  release: string;
  gratitude: string;
  nextStep: string;
}

export interface ThoughtsState {
  entries: ThoughtEntry[];
  reflections: ReflectionEntry[];
}

const FALLBACK: ThoughtsState = {
  entries: [],
  reflections: [],
};

export async function loadThoughtsState(): Promise<ThoughtsState> {
  return readStoredState<ThoughtsState>(STORAGE_KEY, FALLBACK);
}

async function saveThoughtsState(state: ThoughtsState): Promise<void> {
  await writeStoredState(STORAGE_KEY, state);
}

export async function addThought(input: {
  text: string;
  tag: ThoughtTag;
}): Promise<ThoughtsState> {
  const state = await loadThoughtsState();
  const next: ThoughtsState = {
    ...state,
    entries: [createStoredEntity({ text: input.text.trim(), tag: input.tag }), ...state.entries].slice(0, 120),
  };
  await saveThoughtsState(next);
  return next;
}

export async function addReflection(input: {
  release: string;
  gratitude: string;
  nextStep: string;
}): Promise<ThoughtsState> {
  const state = await loadThoughtsState();
  const next: ThoughtsState = {
    ...state,
    reflections: [createStoredEntity(input), ...state.reflections].slice(0, 40),
  };
  await saveThoughtsState(next);
  return next;
}
