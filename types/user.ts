import type { ChallengeCategory, AssessmentResult } from './assessment';

export interface UserProfile {
  id: string;
  displayName: string | null;
  assessmentCompleted: boolean;
  assessmentResults: AssessmentResult | null;
  preferredModules: ChallengeCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
}
