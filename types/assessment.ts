export type LikertValue = 1 | 2 | 3 | 4 | 5;

export const likertLabels: Record<LikertValue, string> = {
  1: 'Never',
  2: 'Rarely',
  3: 'Sometimes',
  4: 'Often',
  5: 'Almost Always',
};

export type ChallengeCategory =
  | 'timeBlindness'
  | 'finance'
  | 'tasks'
  | 'memory'
  | 'dopamine'
  | 'speech'
  | 'thoughts'
  | 'impulse';

export interface AssessmentQuestion {
  id: string;
  text: string;
  category: ChallengeCategory;
}

export interface AssessmentAnswer {
  questionId: string;
  value: LikertValue;
}

export interface CategoryScore {
  category: ChallengeCategory;
  score: number;
  maxScore: number;
  percentage: number;
  label: string;
}

export interface AssessmentResult {
  completedAt: string;
  answers: AssessmentAnswer[];
  categoryScores: CategoryScore[];
  recommendedModules: ChallengeCategory[];
}
