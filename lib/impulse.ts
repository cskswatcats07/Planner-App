import {
  createStoredEntity,
  readStoredState,
  writeStoredState,
  type StoredEntity,
} from './module-storage';

const STORAGE_KEY = '@mindpilot/impulse_state';

export interface IfThenPlan extends StoredEntity {
  trigger: string;
  responsePlan: string;
}

export interface ImpulseLog extends StoredEntity {
  trigger: string;
  urge: string;
  pauseMinutes: number;
  decision: string;
  reflection: string;
}

export interface ImpulseState {
  plans: IfThenPlan[];
  logs: ImpulseLog[];
}

const FALLBACK: ImpulseState = {
  plans: [],
  logs: [],
};

export async function loadImpulseState(): Promise<ImpulseState> {
  return readStoredState<ImpulseState>(STORAGE_KEY, FALLBACK);
}

async function saveImpulseState(state: ImpulseState): Promise<void> {
  await writeStoredState(STORAGE_KEY, state);
}

export async function addIfThenPlan(input: {
  trigger: string;
  responsePlan: string;
}): Promise<ImpulseState> {
  const state = await loadImpulseState();
  const next: ImpulseState = {
    ...state,
    plans: [createStoredEntity({ ...input }), ...state.plans].slice(0, 60),
  };
  await saveImpulseState(next);
  return next;
}

export async function addImpulseLog(input: {
  trigger: string;
  urge: string;
  pauseMinutes: number;
  decision: string;
  reflection: string;
}): Promise<ImpulseState> {
  const state = await loadImpulseState();
  const next: ImpulseState = {
    ...state,
    logs: [createStoredEntity(input), ...state.logs].slice(0, 80),
  };
  await saveImpulseState(next);
  return next;
}
