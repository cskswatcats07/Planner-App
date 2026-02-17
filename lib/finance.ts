import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  createStoredEntity,
  readStoredState,
  writeStoredState,
  type StoredEntity,
} from './module-storage';

const STORAGE_KEY = '@mindpilot/finance_state';

export interface ExpenseItem extends StoredEntity {
  amount: number;
  category: 'food' | 'transport' | 'home' | 'health' | 'other';
  note: string;
}

export interface BillReminder extends StoredEntity {
  title: string;
  amount: number;
  dueAt: string;
  isPaid: boolean;
  notificationId: string | null;
}

export interface FinanceState {
  weeklyBudget: number;
  expenses: ExpenseItem[];
  bills: BillReminder[];
}

const FALLBACK_STATE: FinanceState = {
  weeklyBudget: 250,
  expenses: [],
  bills: [],
};

export async function loadFinanceState(): Promise<FinanceState> {
  return readStoredState<FinanceState>(STORAGE_KEY, FALLBACK_STATE);
}

async function saveFinanceState(state: FinanceState): Promise<void> {
  await writeStoredState(STORAGE_KEY, state);
}

export async function setWeeklyBudget(amount: number): Promise<FinanceState> {
  const state = await loadFinanceState();
  const next: FinanceState = {
    ...state,
    weeklyBudget: Math.max(1, Math.round(amount)),
  };
  await saveFinanceState(next);
  return next;
}

export async function addExpense(input: {
  amount: number;
  category: ExpenseItem['category'];
  note: string;
}): Promise<FinanceState> {
  const state = await loadFinanceState();
  const expense = createStoredEntity({
    amount: Math.max(1, Number(input.amount)),
    category: input.category,
    note: input.note.trim(),
  });
  const next: FinanceState = {
    ...state,
    expenses: [expense, ...state.expenses].slice(0, 120),
  };
  await saveFinanceState(next);
  return next;
}

async function scheduleBillNotification(
  title: string,
  dueAtIso: string
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const dueDate = new Date(dueAtIso);
  if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now()) {
    return null;
  }
  const permission = await Notifications.getPermissionsAsync();
  const granted = permission.granted
    ? true
    : (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bill Reminder',
      body: `${title} is due now.`,
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dueDate,
    },
  });
}

export async function addBill(input: {
  title: string;
  amount: number;
  dueAt: string;
}): Promise<FinanceState> {
  const state = await loadFinanceState();
  const notificationId = await scheduleBillNotification(input.title.trim(), input.dueAt);
  const bill = createStoredEntity({
    title: input.title.trim(),
    amount: Math.max(1, Number(input.amount)),
    dueAt: input.dueAt,
    isPaid: false,
    notificationId,
  });
  const next: FinanceState = {
    ...state,
    bills: [bill, ...state.bills].slice(0, 40),
  };
  await saveFinanceState(next);
  return next;
}

export async function toggleBillPaid(id: string): Promise<FinanceState> {
  const state = await loadFinanceState();
  const next: FinanceState = {
    ...state,
    bills: state.bills.map((bill) =>
      bill.id === id ? { ...bill, isPaid: !bill.isPaid, updatedAt: new Date().toISOString() } : bill
    ),
  };
  await saveFinanceState(next);
  return next;
}

export function getWeeklySpend(expenses: ExpenseItem[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return expenses
    .filter((expense) => new Date(expense.createdAt).getTime() >= weekAgo)
    .reduce((sum, expense) => sum + expense.amount, 0);
}
