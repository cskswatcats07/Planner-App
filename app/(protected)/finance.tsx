import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AIFeedbackCard } from '../../components/ai/AIFeedbackCard';
import { moduleColors, useTheme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import {
  addBill,
  addExpense,
  getWeeklySpend,
  loadFinanceState,
  setWeeklyBudget,
  toggleBillPaid,
  type ExpenseItem,
  type FinanceState,
} from '../../lib/finance';
import { ensureNotificationPermission, getNotificationPermissionState } from '../../lib/notifications';

const CATEGORY_OPTIONS: ExpenseItem['category'][] = [
  'food',
  'transport',
  'home',
  'health',
  'other',
];

function toLocalDatetimeInputValue(date: Date): string {
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function FinanceScreen() {
  const theme = useTheme();
  const colors = moduleColors.finance;
  const [state, setState] = useState<FinanceState | null>(null);

  const [amountInput, setAmountInput] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseItem['category']>('food');
  const [budgetInput, setBudgetInput] = useState('');
  const [billTitle, setBillTitle] = useState('');
  const [billAmountInput, setBillAmountInput] = useState('');
  const [billDueInput, setBillDueInput] = useState(() =>
    toLocalDatetimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000))
  );
  const [statusMessage, setStatusMessage] = useState(
    'Track spend gently. Small awareness beats perfect budgeting.'
  );
  const [notificationHint, setNotificationHint] = useState(
    'Enable notifications to receive bill reminders on time.'
  );

  useEffect(() => {
    loadFinanceState()
      .then((loaded) => {
        setState(loaded);
        setBudgetInput(`${loaded.weeklyBudget}`);
      })
      .catch(() => {
        setStatusMessage('Unable to load finance data.');
      });

    getNotificationPermissionState()
      .then((stateName) => {
        if (stateName === 'granted') {
          setNotificationHint('Notifications are enabled for bill reminders.');
        } else if (stateName === 'unsupported') {
          setNotificationHint('Bill reminders appear in-app on web. Push requires iOS/Android.');
        } else {
          setNotificationHint('Enable notifications to receive bill reminders on time.');
        }
      })
      .catch(() => {
        // keep default hint
      });
  }, []);

  const weeklySpend = useMemo(
    () => getWeeklySpend(state?.expenses ?? []),
    [state?.expenses]
  );
  const weeklyBudget = state?.weeklyBudget ?? 1;
  const budgetProgress = Math.min(1, weeklySpend / Math.max(1, weeklyBudget));
  const remaining = Math.max(0, weeklyBudget - weeklySpend);

  const handleAddExpense = async () => {
    const amount = Math.round(Number(amountInput));
    if (!amount || amount <= 0) {
      setStatusMessage('Enter a valid expense amount.');
      return;
    }
    const next = await addExpense({
      amount,
      category: expenseCategory,
      note: expenseNote || 'Quick expense',
    });
    setState(next);
    setAmountInput('');
    setExpenseNote('');
    setStatusMessage('Expense saved.');
  };

  const handleSetBudget = async () => {
    const amount = Math.round(Number(budgetInput));
    if (!amount || amount <= 0) {
      setStatusMessage('Enter a valid weekly budget.');
      return;
    }
    const next = await setWeeklyBudget(amount);
    setState(next);
    setStatusMessage('Weekly budget updated.');
  };

  const handleAddBill = async () => {
    const amount = Math.round(Number(billAmountInput));
    if (!billTitle.trim() || !amount || amount <= 0) {
      setStatusMessage('Add bill title and amount.');
      return;
    }
    const dueDate = new Date(billDueInput);
    if (Number.isNaN(dueDate.getTime())) {
      setStatusMessage('Use a valid due date/time.');
      return;
    }
    const permissionGranted = await ensureNotificationPermission();
    const next = await addBill({
      title: billTitle.trim(),
      amount,
      dueAt: dueDate.toISOString(),
    });
    setState(next);
    setBillTitle('');
    setBillAmountInput('');
    if (permissionGranted) {
      setStatusMessage('Bill reminder added with notifications enabled.');
    } else {
      setStatusMessage(
        'Bill saved. Notification permission is off, so alert delivery may be limited.'
      );
    }
  };

  const handleToggleBill = async (id: string) => {
    const next = await toggleBillPaid(id);
    setState(next);
  };

  return (
    <SafeAreaWrapper>
      <Header title="Money Manager" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Money with less overwhelm</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Log quickly, watch your weekly runway, and set simple due-date reminders.
          </Text>
          <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>{statusMessage}</Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Weekly Budget</Text>
          <TextInput
            label="Budget amount"
            value={budgetInput}
            onChangeText={setBudgetInput}
            keyboardType="number-pad"
            placeholder="250"
          />
          <Button title="Save Budget" onPress={handleSetBudget} variant="outline" size="md" fullWidth />
          <ProgressBar progress={budgetProgress} color={colors.main} height={10} />
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Spent ${weeklySpend} of ${weeklyBudget} this week. ${remaining} left.
          </Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Expense</Text>
          <View style={styles.row}>
            {CATEGORY_OPTIONS.map((category) => {
              const selected = category === expenseCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.light : theme.colors.surface,
                      borderColor: selected ? colors.main : theme.colors.border,
                    },
                  ]}
                  onPress={() => setExpenseCategory(category)}
                >
                  <Text style={[styles.chipText, { color: theme.colors.text }]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            label="Amount"
            value={amountInput}
            onChangeText={setAmountInput}
            keyboardType="number-pad"
            placeholder="35"
          />
          <TextInput
            label="Note"
            value={expenseNote}
            onChangeText={setExpenseNote}
            placeholder="Lunch after meeting"
          />
          <Button title="Add Expense" onPress={handleAddExpense} variant="primary" size="md" fullWidth />
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Bill Reminders</Text>
          <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>{notificationHint}</Text>
          <TextInput
            label="Bill title"
            value={billTitle}
            onChangeText={setBillTitle}
            placeholder="Internet bill"
          />
          <View style={styles.row}>
            <TextInput
              label="Amount"
              value={billAmountInput}
              onChangeText={setBillAmountInput}
              keyboardType="number-pad"
              containerStyle={styles.half}
            />
            <TextInput
              label="Due date/time"
              value={billDueInput}
              onChangeText={setBillDueInput}
              containerStyle={styles.half}
              placeholder="2026-03-01T18:00"
            />
          </View>
          <Button title="Add Bill Reminder" onPress={handleAddBill} variant="outline" size="md" fullWidth />
          {(state?.bills ?? []).slice(0, 5).map((bill) => (
            <TouchableOpacity key={bill.id} style={styles.billRow} onPress={() => handleToggleBill(bill.id)}>
              <Ionicons
                name={bill.isPaid ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={bill.isPaid ? colors.main : theme.colors.textTertiary}
              />
              <View style={styles.billTextWrap}>
                <Text style={[styles.billTitle, { color: theme.colors.text }]}>{bill.title}</Text>
                <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>
                  ${bill.amount} • due {new Date(bill.dueAt).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        <AIFeedbackCard
          toolName="Money Manager"
          contextSummary={`Weekly budget: ${weeklyBudget}. Weekly spend: ${weeklySpend}. Remaining: ${remaining}. Expense count: ${state?.expenses.length ?? 0}. Bill count: ${state?.bills.length ?? 0}. Status: ${statusMessage}.`}
          presetPrompts={[
            'Suggest three ways to reduce overspending this week.',
            'Give me a simple category budget split for next week.',
            'Create a 5-minute weekly money review ritual.',
          ]}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  section: { gap: spacing.md },
  title: { fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  half: { flex: 1 },
  billRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  billTextWrap: { flex: 1 },
  billTitle: { fontSize: 14, fontWeight: '600' },
});
