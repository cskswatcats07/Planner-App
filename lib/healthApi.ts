import { supabase } from './supabase';

const API_BASE =
  process.env.EXPO_PUBLIC_HEALTH_API_URL ??
  'https://your-health-api.example.com';

async function getJwt(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('You must be signed in to use the health module.');
  }
  return token;
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  if (init.auth !== false) {
    const jwt = await getJwt();
    headers.Authorization = `Bearer ${jwt}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      // ignore parse failure
    }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface PrescriptionPayload {
  medication_name?: string;
  din?: string;
  prescribing_doctor?: string;
  pharmacy_name?: string;
  prescription_number?: string;
  dosage_text?: string;
  notes?: string;
  renewal_date?: string;
  renewal_alert_enabled?: boolean;
  renewal_alert_days_before?: number;
}

export interface NutritionPayload {
  daily_weight?: number;
  goal_weight?: number;
  calorie_target?: number;
  protein_target?: number;
  hydration_target?: number;
  meal_plan_name?: string;
  meal_prep_notes?: string;
  meals?: {
    meal_name?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    notes?: string;
  }[];
  mood_score?: number;
  focus_score?: number;
}

export async function createPrescription(secret: string, data: PrescriptionPayload) {
  return request<{ id: string }>('/health/prescription', {
    method: 'POST',
    body: JSON.stringify({ secret, data }),
  });
}

export async function listPrescriptions(secret: string) {
  return request<
    {
      id: string;
      created_at: string;
      updated_at: string;
      data: PrescriptionPayload;
    }[]
  >(`/health/prescription?secret=${encodeURIComponent(secret)}`, {
    method: 'GET',
  });
}

export async function updatePrescription(
  id: string,
  secret: string,
  data: PrescriptionPayload
) {
  return request<void>(`/health/prescription/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ secret, data }),
  });
}

export async function deletePrescription(id: string) {
  return request<void>(`/health/prescription/${id}`, {
    method: 'DELETE',
  });
}

export async function upsertNutrition(secret: string, data: NutritionPayload) {
  return request<{ id: string }>('/health/nutrition', {
    method: 'POST',
    body: JSON.stringify({ secret, data }),
  });
}

export async function getNutrition(secret: string) {
  return request<
    {
      id: string;
      created_at: string;
      updated_at: string;
      data: NutritionPayload;
    } | null
  >(`/health/nutrition?secret=${encodeURIComponent(secret)}`, {
    method: 'GET',
  });
}

export async function deleteAllHealth() {
  return request<void>('/health/all', { method: 'DELETE' });
}

export async function exportEncryptedHealthJson(secret: string) {
  return request<{ data: unknown }>(
    `/health/export?secret=${encodeURIComponent(secret)}`,
    { method: 'GET' }
  );
}

