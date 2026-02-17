import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { CATEGORY_LABELS } from '../../constants/assessment-questions';
import type { AssessmentQuestion, LikertValue } from '../../types/assessment';
import { LikertScale } from './LikertScale';

interface QuestionCardProps {
  question: AssessmentQuestion;
  selectedValue: LikertValue | null;
  onSelect: (value: LikertValue) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  selectedValue,
  onSelect,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.meta}>
        <Text style={[styles.category, { color: theme.colors.primary }]}>
          {CATEGORY_LABELS[question.category] ?? question.category}
        </Text>
        <Text style={[styles.counter, { color: theme.colors.textTertiary }]}>
          {questionNumber} of {totalQuestions}
        </Text>
      </View>

      <Text style={[styles.questionText, { color: theme.colors.text }]}>
        {question.text}
      </Text>

      <LikertScale value={selectedValue ?? undefined} onChange={onSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counter: {
    fontSize: 13,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
  },
});
