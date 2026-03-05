import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import {
  createPrescription,
  listPrescriptions,
  updatePrescription,
  deletePrescription,
  upsertNutrition,
  getNutrition,
  exportEncryptedHealthJson,
  type PrescriptionPayload,
  type NutritionPayload,
} from '../../lib/healthApi';
import {
  getHealthConsentTimestamp,
  setHealthConsentTimestamp,
} from '../../lib/storage';

export default function HealthDashboardScreen() {
  const theme = useTheme();
  const [consentAt, setConsentAt] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [loadingConsent, setLoadingConsent] = useState(true);

  const [secret, setSecret] = useState('');

  const [prescription, setPrescription] = useState<PrescriptionPayload & { id?: string }>({
    renewal_alert_enabled: false,
  });
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  const [nutrition, setNutrition] = useState<NutritionPayload>({});
  const [nutritionLoading, setNutritionLoading] = useState(false);

  useEffect(() => {
    getHealthConsentTimestamp()
      .then((ts) => {
        setConsentAt(ts);
      })
      .finally(() => setLoadingConsent(false));
  }, []);

  const handleAcceptConsent = async () => {
    const now = new Date().toISOString();
    await setHealthConsentTimestamp(now);
    setConsentAt(now);
  };

  const handleLoad = async () => {
    if (!secret.trim()) {
      Alert.alert('Health Key Required', 'Enter your health passphrase to load data.');
      return;
    }
    try {
      setPrescriptionLoading(true);
      setNutritionLoading(true);
      const [prescriptions, nutritionEntry] = await Promise.all([
        listPrescriptions(secret.trim()).catch(() => []),
        getNutrition(secret.trim()).catch(() => null),
      ]);

      if (prescriptions.length > 0) {
        const first = prescriptions[0];
        setPrescription({ ...first.data, id: first.id });
      }

      if (nutritionEntry) {
        setNutrition(nutritionEntry.data);
      }
    } catch (err: any) {
      Alert.alert('Unable to load', err.message ?? 'Unable to load health data.');
    } finally {
      setPrescriptionLoading(false);
      setNutritionLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!secret.trim()) {
      Alert.alert('Health Key Required', 'Enter your health passphrase first.');
      return;
    }
    try {
      setPrescriptionLoading(true);
      const { id, ...payload } = prescription;

      const enabled = !!payload.renewal_alert_enabled;
      if (enabled) {
        if (!payload.renewal_date) {
          Alert.alert('Missing renewal date', 'Set a renewal date when alerts are enabled.');
          return;
        }
        if (
          payload.renewal_alert_days_before === undefined ||
          payload.renewal_alert_days_before === null
        ) {
          Alert.alert(
            'Missing alert window',
            'Set days before renewal when alerts are enabled.'
          );
          return;
        }
      }

      if (id) {
        await updatePrescription(id, secret.trim(), payload);
      } else {
        const created = await createPrescription(secret.trim(), payload);
        setPrescription((prev) => ({ ...prev, id: created.id }));
      }
      Alert.alert('Saved', 'Prescription details saved securely.');
    } catch (err: any) {
      Alert.alert('Save failed', err.message ?? 'Unable to save prescription.');
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const handleDeletePrescription = async () => {
    if (!prescription.id) return;
    Alert.alert('Delete Prescription', 'Delete this saved prescription?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePrescription(prescription.id!);
            setPrescription({ renewal_alert_enabled: false });
          } catch (err: any) {
            Alert.alert('Delete failed', err.message ?? 'Unable to delete prescription.');
          }
        },
      },
    ]);
  };

  const handleSaveNutrition = async () => {
    if (!secret.trim()) {
      Alert.alert('Health Key Required', 'Enter your health passphrase first.');
      return;
    }
    try {
      setNutritionLoading(true);
      await upsertNutrition(secret.trim(), nutrition);
      Alert.alert('Saved', 'Nutrition details saved securely.');
    } catch (err: any) {
      Alert.alert('Save failed', err.message ?? 'Unable to save nutrition.');
    } finally {
      setNutritionLoading(false);
    }
  };

  const handleExport = async () => {
    if (!secret.trim()) {
      Alert.alert('Health Key Required', 'Enter your health passphrase first.');
      return;
    }
    try {
      const result = await exportEncryptedHealthJson(secret.trim());
      Alert.alert(
        'Encrypted Export',
        'Copy this encrypted JSON to store or share securely:\n\n' +
          JSON.stringify(result.data, null, 2)
      );
    } catch (err: any) {
      Alert.alert('Export failed', err.message ?? 'Unable to export health data.');
    }
  };

  const consentRequired = !consentAt;

  return (
    <SafeAreaWrapper>
      <Header title="Health Dashboard" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Health Data & Safety
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            This space is for your own records only. Data is encrypted before it
            leaves your device. MindPilot does not provide medical advice or
            dosage guidance and does not contact pharmacies or clinicians.
          </Text>
          {consentRequired && !loadingConsent ? (
            <>
              <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
                To continue, please confirm that you understand this is a
                personal tracking tool and not a medical service.
              </Text>
              <Button
                title="I understand and agree"
                onPress={handleAcceptConsent}
                variant="primary"
                size="md"
                fullWidth
              />
            </>
          ) : null}
        </Card>

        {!consentRequired && (
          <>
            <Card variant="outlined" padding="lg" style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Health Passphrase
              </Text>
              <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
                Enter a secret phrase you will remember. It is used to derive
                your encryption key and is never stored. You must use the same
                passphrase to view or edit your health data.
              </Text>
              <TextInput
                label="Health passphrase"
                value={secret}
                onChangeText={setSecret}
                secureTextEntry
                autoCapitalize="none"
              />
              <View style={styles.inlineButtons}>
                <Button
                  title="Load existing data"
                  onPress={handleLoad}
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  loading={prescriptionLoading || nutritionLoading}
                />
                <Button
                  title="Export encrypted JSON"
                  onPress={handleExport}
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                />
              </View>
            </Card>

            <Card variant="elevated" padding="lg" style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Prescription
              </Text>
              <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>
                All fields are optional. No dosages are checked or recommended.
              </Text>
              <TextInput
                label="Medication name (optional)"
                value={prescription.medication_name ?? ''}
                onChangeText={(text) =>
                  setPrescription((prev) => ({ ...prev, medication_name: text }))
                }
              />
              <TextInput
                label="DIN (optional)"
                value={prescription.din ?? ''}
                onChangeText={(text) =>
                  setPrescription((prev) => ({ ...prev, din: text }))
                }
              />
              <TextInput
                label="Prescribing doctor (optional)"
                value={prescription.prescribing_doctor ?? ''}
                onChangeText={(text) =>
                  setPrescription((prev) => ({ ...prev, prescribing_doctor: text }))
                }
              />
              <TextInput
                label="Pharmacy name (optional)"
                value={prescription.pharmacy_name ?? ''}
                onChangeText={(text) =>
                  setPrescription((prev) => ({ ...prev, pharmacy_name: text }))
                }
              />
              <TextInput
                label="Prescription number (optional)"
                value={prescription.prescription_number ?? ''}
                onChangeText={(text) =>
                  setPrescription((prev) => ({ ...prev, prescription_number: text }))
                }
              />
              <TextInput
                label="Dosage notes (free text, optional)"
                value={prescription.dosage_text ?? ''}
                onChangeText={(text) =>
                  setPrescription((prev) => ({ ...prev, dosage_text: text }))
                }
                multiline
              />
              <TextInput
                label="Other notes (optional)"
                value={prescription.notes ?? ''}
                onChangeText={(text) =>
                  setPrescription((prev) => ({ ...prev, notes: text }))
                }
                multiline
              />
              <View style={styles.inlineToggleRow}>
                <Text style={[styles.body, { color: theme.colors.text }]}>
                  Renewal alerts
                </Text>
                <Button
                  title={prescription.renewal_alert_enabled ? 'On' : 'Off'}
                  onPress={() =>
                    setPrescription((prev) => ({
                      ...prev,
                      renewal_alert_enabled: !prev.renewal_alert_enabled,
                    }))
                  }
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                />
              </View>
              {prescription.renewal_alert_enabled ? (
                <>
                  <TextInput
                    label="Renewal date (ISO, e.g. 2026-01-31)"
                    value={prescription.renewal_date ?? ''}
                    onChangeText={(text) =>
                      setPrescription((prev) => ({ ...prev, renewal_date: text }))
                    }
                  />
                  <TextInput
                    label="Days before to remind (required)"
                    value={
                      prescription.renewal_alert_days_before !== undefined &&
                      prescription.renewal_alert_days_before !== null
                        ? String(prescription.renewal_alert_days_before)
                        : ''
                    }
                    keyboardType="number-pad"
                    onChangeText={(text) =>
                      setPrescription((prev) => ({
                        ...prev,
                        renewal_alert_days_before: text ? Number(text) : undefined,
                      }))
                    }
                  />
                </>
              ) : null}
              <View style={styles.inlineButtons}>
                <Button
                  title="Save prescription"
                  onPress={handleSavePrescription}
                  variant="primary"
                  size="md"
                  fullWidth={false}
                  loading={prescriptionLoading}
                />
                {prescription.id ? (
                  <Button
                    title="Delete"
                    onPress={handleDeletePrescription}
                    variant="ghost"
                    size="sm"
                    fullWidth={false}
                  />
                ) : null}
              </View>
            </Card>

            <Card variant="elevated" padding="lg" style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Nutrition & Metrics
              </Text>
              <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>
                All fields are optional. MindPilot does not optimize or score your
                entries.
              </Text>
              <View style={styles.inlineRow}>
                <TextInput
                  label="Daily weight (optional)"
                  value={
                    nutrition.daily_weight !== undefined
                      ? String(nutrition.daily_weight)
                      : ''
                  }
                  keyboardType="numeric"
                  containerStyle={styles.inlineField}
                  onChangeText={(text) =>
                    setNutrition((prev) => ({
                      ...prev,
                      daily_weight: text ? Number(text) : undefined,
                    }))
                  }
                />
                <TextInput
                  label="Goal weight (optional)"
                  value={
                    nutrition.goal_weight !== undefined
                      ? String(nutrition.goal_weight)
                      : ''
                  }
                  keyboardType="numeric"
                  containerStyle={styles.inlineField}
                  onChangeText={(text) =>
                    setNutrition((prev) => ({
                      ...prev,
                      goal_weight: text ? Number(text) : undefined,
                    }))
                  }
                />
              </View>
              <View style={styles.inlineRow}>
                <TextInput
                  label="Calories / day (optional)"
                  value={
                    nutrition.calorie_target !== undefined
                      ? String(nutrition.calorie_target)
                      : ''
                  }
                  keyboardType="numeric"
                  containerStyle={styles.inlineField}
                  onChangeText={(text) =>
                    setNutrition((prev) => ({
                      ...prev,
                      calorie_target: text ? Number(text) : undefined,
                    }))
                  }
                />
                <TextInput
                  label="Protein / day (g, optional)"
                  value={
                    nutrition.protein_target !== undefined
                      ? String(nutrition.protein_target)
                      : ''
                  }
                  keyboardType="numeric"
                  containerStyle={styles.inlineField}
                  onChangeText={(text) =>
                    setNutrition((prev) => ({
                      ...prev,
                      protein_target: text ? Number(text) : undefined,
                    }))
                  }
                />
              </View>
              <TextInput
                label="Hydration target (optional)"
                value={
                  nutrition.hydration_target !== undefined
                    ? String(nutrition.hydration_target)
                    : ''
                }
                keyboardType="numeric"
                onChangeText={(text) =>
                  setNutrition((prev) => ({
                    ...prev,
                    hydration_target: text ? Number(text) : undefined,
                  }))
                }
              />
              <TextInput
                label="Meal plan name (optional)"
                value={nutrition.meal_plan_name ?? ''}
                onChangeText={(text) =>
                  setNutrition((prev) => ({ ...prev, meal_plan_name: text }))
                }
              />
              <TextInput
                label="Meal prep notes (optional)"
                value={nutrition.meal_prep_notes ?? ''}
                onChangeText={(text) =>
                  setNutrition((prev) => ({ ...prev, meal_prep_notes: text }))
                }
                multiline
              />
              <TextInput
                label="Mood score (optional)"
                value={
                  nutrition.mood_score !== undefined
                    ? String(nutrition.mood_score)
                    : ''
                }
                keyboardType="numeric"
                onChangeText={(text) =>
                  setNutrition((prev) => ({
                    ...prev,
                    mood_score: text ? Number(text) : undefined,
                  }))
                }
              />
              <TextInput
                label="Focus score (optional)"
                value={
                  nutrition.focus_score !== undefined
                    ? String(nutrition.focus_score)
                    : ''
                }
                keyboardType="numeric"
                onChangeText={(text) =>
                  setNutrition((prev) => ({
                    ...prev,
                    focus_score: text ? Number(text) : undefined,
                  }))
                }
              />
              <Button
                title="Save nutrition"
                onPress={handleSaveNutrition}
                variant="primary"
                size="md"
                fullWidth
                loading={nutritionLoading}
              />
            </Card>

            <Text style={[styles.disclaimer, { color: theme.colors.textTertiary }]}>
              This tool does not provide medical advice. It is a personal tracking
              system only.
            </Text>
          </>
        )}
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inlineField: {
    flex: 1,
  },
  inlineButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  inlineToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});

