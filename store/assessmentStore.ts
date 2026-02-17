import { create } from 'zustand';
import type {
  AssessmentAnswer,
  AssessmentResult,
  ChallengeCategory,
  CategoryScore,
  LikertValue,
} from '../types/assessment';
import { ASSESSMENT_QUESTIONS, CATEGORY_LABELS } from '../constants/assessment-questions';
import { saveAssessmentResult, getAssessmentResult } from '../lib/storage';

interface AssessmentStore {
  answers: AssessmentAnswer[];
  currentQuestionIndex: number;
  result: AssessmentResult | null;
  isLoaded: boolean;

  loadSavedResult: () => Promise<void>;
  setAnswer: (questionId: string, value: LikertValue) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  computeAndSaveResults: () => Promise<void>;
  reset: () => void;
}

function computeCategoryScores(answers: AssessmentAnswer[]): CategoryScore[] {
  const categories: ChallengeCategory[] = [
    'timeBlindness', 'finance', 'tasks', 'memory',
    'dopamine', 'speech', 'thoughts', 'impulse',
  ];

  return categories.map((category) => {
    const categoryQuestions = ASSESSMENT_QUESTIONS.filter(
      (q) => q.category === category
    );
    const categoryAnswers = answers.filter((a) =>
      categoryQuestions.some((q) => q.id === a.questionId)
    );

    const score = categoryAnswers.reduce((sum, a) => sum + a.value, 0);
    const maxScore = categoryQuestions.length * 5;
    const percentage = maxScore > 0 ? score / maxScore : 0;

    return {
      category,
      score,
      maxScore,
      percentage,
      label: CATEGORY_LABELS[category] ?? category,
    };
  });
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  answers: [],
  currentQuestionIndex: 0,
  result: null,
  isLoaded: false,

  loadSavedResult: async () => {
    const result = await getAssessmentResult();
    set({ result, isLoaded: true });
  },

  setAnswer: (questionId, value) => {
    const { answers } = get();
    const existing = answers.findIndex((a) => a.questionId === questionId);
    const updated = [...answers];

    if (existing >= 0) {
      updated[existing] = { questionId, value };
    } else {
      updated.push({ questionId, value });
    }

    set({ answers: updated });
  },

  nextQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  goToQuestion: (index) => {
    if (index >= 0 && index < ASSESSMENT_QUESTIONS.length) {
      set({ currentQuestionIndex: index });
    }
  },

  computeAndSaveResults: async () => {
    const { answers } = get();
    const categoryScores = computeCategoryScores(answers);

    const RECOMMENDATION_THRESHOLD = 0.5;
    const recommendedModules = categoryScores
      .filter((s) => s.percentage >= RECOMMENDATION_THRESHOLD)
      .sort((a, b) => b.percentage - a.percentage)
      .map((s) => s.category);

    const result: AssessmentResult = {
      completedAt: new Date().toISOString(),
      answers,
      categoryScores,
      recommendedModules,
    };

    await saveAssessmentResult(result);
    set({ result });
  },

  reset: () => {
    set({
      answers: [],
      currentQuestionIndex: 0,
      result: null,
    });
  },
}));
