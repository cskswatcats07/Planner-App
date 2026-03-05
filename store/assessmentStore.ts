import { create } from 'zustand';
import type {
  AssessmentAnswer,
  AssessmentResult,
  AssessmentMode,
  ChallengeCategory,
  CategoryScore,
  LikertValue,
} from '../types/assessment';
import {
  ASSESSMENT_QUESTIONS,
  CATEGORY_LABELS,
  QUICK_ASSESSMENT_QUESTIONS,
} from '../constants/assessment-questions';
import { saveAssessmentResult, getAssessmentResult } from '../lib/storage';

interface AssessmentStore {
  answers: AssessmentAnswer[];
  currentQuestionIndex: number;
  result: AssessmentResult | null;
  isLoaded: boolean;
  mode: AssessmentMode;

  loadSavedResult: () => Promise<void>;
  start: (mode: AssessmentMode) => void;
  setAnswer: (questionId: string, value: LikertValue) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  computeAndSaveResults: () => Promise<void>;
  reset: () => void;
}

function getQuestionsForMode(mode: AssessmentMode) {
  return mode === 'quick' ? QUICK_ASSESSMENT_QUESTIONS : ASSESSMENT_QUESTIONS;
}

function computeCategoryScores(
  answers: AssessmentAnswer[],
  mode: AssessmentMode
): CategoryScore[] {
  const categories: ChallengeCategory[] = [
    'timeBlindness', 'finance', 'tasks', 'memory',
    'dopamine', 'speech', 'thoughts', 'impulse',
  ];

  return categories.map((category) => {
    const questionSet = getQuestionsForMode(mode);
    const categoryQuestions = questionSet.filter(
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
  mode: 'quick',

  loadSavedResult: async () => {
    const result = await getAssessmentResult();
    set({ result, isLoaded: true });
  },

  start: (mode) => {
    set({
      mode,
      answers: [],
      currentQuestionIndex: 0,
    });
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
    const { currentQuestionIndex, mode } = get();
    const questionSet = getQuestionsForMode(mode);
    if (currentQuestionIndex < questionSet.length - 1) {
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
    const { mode } = get();
    const questionSet = getQuestionsForMode(mode);
    if (index >= 0 && index < questionSet.length) {
      set({ currentQuestionIndex: index });
    }
  },

  computeAndSaveResults: async () => {
    const { answers, mode } = get();
    const categoryScores = computeCategoryScores(answers, mode);

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
      mode,
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
