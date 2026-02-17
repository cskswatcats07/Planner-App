import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AssessmentResult } from '../types/assessment';

const KEYS = {
  ASSESSMENT_RESULT: '@mindpilot/assessment_result',
  HAS_SEEN_ONBOARDING: '@mindpilot/has_seen_onboarding',
} as const;

export async function saveAssessmentResult(result: AssessmentResult): Promise<void> {
  await AsyncStorage.setItem(KEYS.ASSESSMENT_RESULT, JSON.stringify(result));
}

export async function getAssessmentResult(): Promise<AssessmentResult | null> {
  const raw = await AsyncStorage.getItem(KEYS.ASSESSMENT_RESULT);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AssessmentResult;
  } catch {
    return null;
  }
}

export async function clearAssessmentResult(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.ASSESSMENT_RESULT);
}

export async function setOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(KEYS.HAS_SEEN_ONBOARDING, 'true');
}

export async function hasSeenOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.HAS_SEEN_ONBOARDING);
  return value === 'true';
}
