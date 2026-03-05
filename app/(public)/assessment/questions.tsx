import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '../../../components/layout/SafeAreaWrapper';
import { Header } from '../../../components/layout/Header';
import { Button } from '../../../components/ui/Button';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { LikertScale } from '../../../components/assessment/LikertScale';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import {
  ASSESSMENT_QUESTIONS,
  CATEGORY_LABELS,
  QUICK_ASSESSMENT_QUESTIONS,
} from '../../../constants/assessment-questions';
import { DISCLAIMERS } from '../../../constants/disclaimers';
import { useAssessmentStore } from '../../../store/assessmentStore';
import type { LikertValue } from '../../../types/assessment';

export default function AssessmentQuestionsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const {
    answers,
    currentQuestionIndex,
    mode,
    setAnswer,
    nextQuestion,
    previousQuestion,
    computeAndSaveResults,
  } = useAssessmentStore();

  const questionSet =
    mode === 'quick' ? QUICK_ASSESSMENT_QUESTIONS : ASSESSMENT_QUESTIONS;

  const question = questionSet[currentQuestionIndex];
  const totalQuestions = questionSet.length;
  const progress = (currentQuestionIndex + 1) / totalQuestions;

  const currentAnswer = answers.find((a) => a.questionId === question.id);
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleSelect = (value: LikertValue) => {
    setAnswer(question.id, value);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      await computeAndSaveResults();
      router.replace('/(public)/assessment/results');
    } else {
      nextQuestion();
    }
  };

  const handleBack = () => {
    if (isFirstQuestion) {
      router.back();
    } else {
      previousQuestion();
    }
  };

  return (
    <SafeAreaWrapper>
      <Header
        title={mode === 'quick' ? 'Quick Assessment' : 'Detailed Assessment'}
        showBack
      />
      <View style={styles.progressSection}>
        <ProgressBar progress={progress} />
        <Text style={[styles.progressText, { color: theme.colors.textTertiary }]}>
          {currentQuestionIndex + 1} of {totalQuestions}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.category, { color: theme.colors.primary }]}>
          {CATEGORY_LABELS[question.category]}
        </Text>

        <Text style={[styles.question, { color: theme.colors.text }]}>
          {question.text}
        </Text>

        <LikertScale
          value={currentAnswer?.value}
          onChange={handleSelect}
        />
      </ScrollView>

      <View style={styles.navigation}>
        <Button
          title="Back"
          onPress={handleBack}
          variant="ghost"
          size="md"
        />
        <Button
          title={isLastQuestion ? 'See Results' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="md"
          disabled={!currentAnswer}
        />
      </View>

      <Text style={[styles.disclaimer, { color: theme.colors.textTertiary }]}>
        {DISCLAIMERS.assessmentFooter}
      </Text>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  progressSection: {
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: spacing['2xl'],
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  disclaimer: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
});
