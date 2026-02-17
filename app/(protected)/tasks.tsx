import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { AIFeedbackCard } from '../../components/ai/AIFeedbackCard';
import { moduleColors, useTheme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import {
  addBreakdownTask,
  addPriorityItem,
  addTop3Task,
  loadTasksState,
  removeTop3Task,
  toggleBreakdownStep,
  type PriorityQuadrant,
  type TasksState,
} from '../../lib/tasks';

const QUADRANTS: { key: PriorityQuadrant; label: string }[] = [
  { key: 'urgentImportant', label: 'Urgent + Important' },
  { key: 'importantNotUrgent', label: 'Important + Not Urgent' },
  { key: 'urgentNotImportant', label: 'Urgent + Delegatable' },
  { key: 'later', label: 'Later' },
];

export default function TasksScreen() {
  const theme = useTheme();
  const colors = moduleColors.tasks;
  const [state, setState] = useState<TasksState | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [top3Input, setTop3Input] = useState('');
  const [priorityTitle, setPriorityTitle] = useState('');
  const [priorityQuadrant, setPriorityQuadrant] = useState<PriorityQuadrant>('urgentImportant');
  const [statusMessage, setStatusMessage] = useState('One clear next step beats a perfect plan.');

  useEffect(() => {
    loadTasksState()
      .then(setState)
      .catch(() => setStatusMessage('Unable to load tasks data.'));
  }, []);

  const completionRate = useMemo(() => {
    const steps = (state?.breakdowns ?? []).flatMap((item) => item.steps);
    if (steps.length === 0) return 0;
    return steps.filter((step) => step.done).length / steps.length;
  }, [state?.breakdowns]);

  const handleAddBreakdown = async () => {
    const steps = stepsInput
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!taskTitle.trim() || steps.length === 0) {
      setStatusMessage('Add a task and at least one step.');
      return;
    }
    const next = await addBreakdownTask({ title: taskTitle, steps });
    setState(next);
    setTaskTitle('');
    setStepsInput('');
    setStatusMessage('Task broken into steps.');
  };

  const handleToggleStep = async (taskId: string, stepId: string) => {
    const next = await toggleBreakdownStep(taskId, stepId);
    setState(next);
  };

  const handleAddTop3 = async () => {
    if (!top3Input.trim()) {
      setStatusMessage('Add one focus item.');
      return;
    }
    const next = await addTop3Task(top3Input);
    setState(next);
    setTop3Input('');
    setStatusMessage(next.top3.length >= 3 ? 'Top 3 is full. Great focus.' : 'Added to Top 3.');
  };

  const handleRemoveTop3 = async (id: string) => {
    const next = await removeTop3Task(id);
    setState(next);
  };

  const handleAddPriority = async () => {
    if (!priorityTitle.trim()) {
      setStatusMessage('Add a priority item title.');
      return;
    }
    const next = await addPriorityItem({ title: priorityTitle, quadrant: priorityQuadrant });
    setState(next);
    setPriorityTitle('');
    setStatusMessage('Priority item added.');
  };

  return (
    <SafeAreaWrapper>
      <Header title="Task Pilot" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Turn overwhelm into sequence</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Break big tasks down, protect your top 3, and sort noise by priority.
          </Text>
          <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>{statusMessage}</Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Breakdown Wizard</Text>
          <TextInput
            label="Big task"
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder="Launch onboarding checklist"
          />
          <TextInput
            label="Steps (one per line)"
            value={stepsInput}
            onChangeText={setStepsInput}
            multiline
            placeholder={'Write draft\nReview with team\nShip version 1'}
          />
          <Button title="Create Breakdown" onPress={handleAddBreakdown} variant="primary" size="md" fullWidth />
          {(state?.breakdowns ?? []).slice(0, 3).map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
              {task.steps.map((step) => (
                <TouchableOpacity
                  key={step.id}
                  style={styles.row}
                  onPress={() => handleToggleStep(task.id, step.id)}
                >
                  <Ionicons
                    name={step.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={step.done ? colors.main : theme.colors.textTertiary}
                  />
                  <Text style={[styles.body, { color: theme.colors.text }]}>{step.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top 3 Focus</Text>
          <TextInput
            label="Focus item"
            value={top3Input}
            onChangeText={setTop3Input}
            placeholder="Finalize sprint plan"
          />
          <Button title="Add to Top 3" onPress={handleAddTop3} variant="outline" size="md" fullWidth />
          {(state?.top3 ?? []).map((item, index) => (
            <TouchableOpacity key={item.id} style={styles.row} onPress={() => handleRemoveTop3(item.id)}>
              <Text style={[styles.rank, { color: colors.main }]}>{index + 1}</Text>
              <Text style={[styles.body, { color: theme.colors.text }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Priority Board</Text>
          <TextInput
            label="Item"
            value={priorityTitle}
            onChangeText={setPriorityTitle}
            placeholder="Pay utility bill"
          />
          <View style={styles.chipWrap}>
            {QUADRANTS.map((quadrant) => {
              const selected = quadrant.key === priorityQuadrant;
              return (
                <TouchableOpacity
                  key={quadrant.key}
                  onPress={() => setPriorityQuadrant(quadrant.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.light : theme.colors.surface,
                      borderColor: selected ? colors.main : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: theme.colors.text }]}>{quadrant.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Button title="Add Priority Item" onPress={handleAddPriority} variant="outline" size="md" fullWidth />

          {QUADRANTS.map((quadrant) => {
            const items = (state?.priorities ?? []).filter((item) => item.quadrant === quadrant.key);
            if (items.length === 0) return null;
            return (
              <View key={quadrant.key} style={styles.section}>
                <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{quadrant.label}</Text>
                {items.slice(0, 3).map((item) => (
                  <Text key={item.id} style={[styles.body, { color: theme.colors.textSecondary }]}>
                    - {item.title}
                  </Text>
                ))}
              </View>
            );
          })}
        </Card>

        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Step completion trend: {Math.round(completionRate * 100)}%
          </Text>
        </Card>

        <AIFeedbackCard
          toolName="Task Pilot"
          contextSummary={`Breakdown tasks: ${state?.breakdowns.length ?? 0}. Top 3 count: ${state?.top3.length ?? 0}. Priority items: ${state?.priorities.length ?? 0}. Completion rate: ${Math.round(completionRate * 100)}%. Status: ${statusMessage}.`}
          presetPrompts={[
            'Rewrite my top 3 into clearer outcome-based tasks.',
            'Suggest one next action for each urgent-important item.',
            'Help me trim my task list to reduce overload today.',
          ]}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.base, gap: spacing.lg, paddingBottom: spacing['3xl'] },
  section: { gap: spacing.md },
  title: { fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  taskTitle: { fontSize: 15, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 21, flex: 1 },
  caption: { fontSize: 12, lineHeight: 18 },
  taskCard: { gap: spacing.sm, backgroundColor: '#F8FAFC', padding: spacing.md, borderRadius: borderRadius.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rank: { fontSize: 16, fontWeight: '700', width: 18 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
});
