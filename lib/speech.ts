import {
  createStoredEntity,
  readStoredState,
  writeStoredState,
  type StoredEntity,
} from './module-storage';

const STORAGE_KEY = '@mindpilot/speech_state';

export interface ConversationPlan extends StoredEntity {
  context: string;
  goal: string;
  keyPoints: string[];
  boundary: string;
}

export interface MessageDraft extends StoredEntity {
  templateType: 'checkIn' | 'boundary' | 'followUp';
  content: string;
}

export interface SpeechState {
  plans: ConversationPlan[];
  drafts: MessageDraft[];
}

const FALLBACK: SpeechState = {
  plans: [],
  drafts: [],
};

export const TEMPLATE_MAP: Record<MessageDraft['templateType'], string> = {
  checkIn: 'Hey, quick check-in: [topic]. My goal is [goal].',
  boundary: 'I care about this and need [boundary]. Can we align on [request]?',
  followUp: 'Following up on [topic]. Next step from my side: [step].',
};

export async function loadSpeechState(): Promise<SpeechState> {
  return readStoredState<SpeechState>(STORAGE_KEY, FALLBACK);
}

async function saveSpeechState(state: SpeechState): Promise<void> {
  await writeStoredState(STORAGE_KEY, state);
}

export async function addConversationPlan(input: {
  context: string;
  goal: string;
  keyPoints: string[];
  boundary: string;
}): Promise<SpeechState> {
  const state = await loadSpeechState();
  const next: SpeechState = {
    ...state,
    plans: [
      createStoredEntity({
        context: input.context.trim(),
        goal: input.goal.trim(),
        keyPoints: input.keyPoints.map((p) => p.trim()).filter(Boolean),
        boundary: input.boundary.trim(),
      }),
      ...state.plans,
    ].slice(0, 40),
  };
  await saveSpeechState(next);
  return next;
}

export async function addMessageDraft(input: {
  templateType: MessageDraft['templateType'];
  content: string;
}): Promise<SpeechState> {
  const state = await loadSpeechState();
  const next: SpeechState = {
    ...state,
    drafts: [createStoredEntity({ ...input }), ...state.drafts].slice(0, 60),
  };
  await saveSpeechState(next);
  return next;
}
