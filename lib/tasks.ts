import {
  createStoredEntity,
  readStoredState,
  writeStoredState,
  type StoredEntity,
} from './module-storage';

const STORAGE_KEY = '@mindpilot/tasks_state';

export type PriorityQuadrant =
  | 'urgentImportant'
  | 'importantNotUrgent'
  | 'urgentNotImportant'
  | 'later';

export interface TaskStep extends StoredEntity {
  title: string;
  done: boolean;
}

export interface BreakdownTask extends StoredEntity {
  title: string;
  steps: TaskStep[];
}

export interface FocusTask extends StoredEntity {
  title: string;
}

export interface PriorityItem extends StoredEntity {
  title: string;
  quadrant: PriorityQuadrant;
}

export interface TasksState {
  breakdowns: BreakdownTask[];
  top3: FocusTask[];
  priorities: PriorityItem[];
}

const FALLBACK: TasksState = {
  breakdowns: [],
  top3: [],
  priorities: [],
};

export async function loadTasksState(): Promise<TasksState> {
  return readStoredState<TasksState>(STORAGE_KEY, FALLBACK);
}

async function saveTasksState(state: TasksState): Promise<void> {
  await writeStoredState(STORAGE_KEY, state);
}

export async function addBreakdownTask(input: {
  title: string;
  steps: string[];
}): Promise<TasksState> {
  const state = await loadTasksState();
  const task = createStoredEntity({
    title: input.title.trim(),
    steps: input.steps
      .map((step) => step.trim())
      .filter(Boolean)
      .map((step) => createStoredEntity({ title: step, done: false })),
  });
  const next: TasksState = {
    ...state,
    breakdowns: [task, ...state.breakdowns].slice(0, 40),
  };
  await saveTasksState(next);
  return next;
}

export async function toggleBreakdownStep(
  taskId: string,
  stepId: string
): Promise<TasksState> {
  const state = await loadTasksState();
  const next: TasksState = {
    ...state,
    breakdowns: state.breakdowns.map((task) =>
      task.id !== taskId
        ? task
        : {
            ...task,
            updatedAt: new Date().toISOString(),
            steps: task.steps.map((step) =>
              step.id === stepId
                ? { ...step, done: !step.done, updatedAt: new Date().toISOString() }
                : step
            ),
          }
    ),
  };
  await saveTasksState(next);
  return next;
}

export async function addTop3Task(title: string): Promise<TasksState> {
  const state = await loadTasksState();
  if (state.top3.length >= 3) return state;
  const next: TasksState = {
    ...state,
    top3: [...state.top3, createStoredEntity({ title: title.trim() })],
  };
  await saveTasksState(next);
  return next;
}

export async function removeTop3Task(id: string): Promise<TasksState> {
  const state = await loadTasksState();
  const next: TasksState = {
    ...state,
    top3: state.top3.filter((item) => item.id !== id),
  };
  await saveTasksState(next);
  return next;
}

export async function addPriorityItem(input: {
  title: string;
  quadrant: PriorityQuadrant;
}): Promise<TasksState> {
  const state = await loadTasksState();
  const next: TasksState = {
    ...state,
    priorities: [createStoredEntity({ title: input.title.trim(), quadrant: input.quadrant }), ...state.priorities].slice(
      0,
      80
    ),
  };
  await saveTasksState(next);
  return next;
}
