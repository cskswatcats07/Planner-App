import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { AIFeedbackCard } from '../../components/ai/AIFeedbackCard';
import { moduleColors, useTheme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import {
  TEMPLATE_MAP,
  addConversationPlan,
  addMessageDraft,
  loadSpeechState,
  type MessageDraft,
  type SpeechState,
} from '../../lib/speech';
import { generateSpeechAudioFeedback } from '../../lib/gemini';

const TEMPLATE_TYPES: MessageDraft['templateType'][] = ['checkIn', 'boundary', 'followUp'];

function formatMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SpeechScreen() {
  const theme = useTheme();
  const colors = moduleColors.speech;
  const [state, setState] = useState<SpeechState | null>(null);
  const [context, setContext] = useState('');
  const [goal, setGoal] = useState('');
  const [keyPointsInput, setKeyPointsInput] = useState('');
  const [boundary, setBoundary] = useState('');
  const [templateType, setTemplateType] = useState<MessageDraft['templateType']>('checkIn');
  const [draftContent, setDraftContent] = useState(TEMPLATE_MAP.checkIn);
  const [paceSecondsLeft, setPaceSecondsLeft] = useState(120);
  const [isPaceRunning, setIsPaceRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Slow is clear. Clear is kind.');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState('');
  const [audioContextHint, setAudioContextHint] = useState('Difficult conversation preparation');
  const [allowAudioForSession, setAllowAudioForSession] = useState(false);
  const AUDIO_CONTEXT_PRESETS = [
    'Difficult conversation preparation',
    'Weekly check-in update',
    'Setting a boundary respectfully',
  ];

  useEffect(() => {
    loadSpeechState().then(setState).catch(() => setStatusMessage('Unable to load speech tools.'));
  }, []);

  useEffect(() => {
    if (!isPaceRunning) return;
    const interval = setInterval(() => {
      setPaceSecondsLeft((current) => {
        if (current <= 1) {
          setIsPaceRunning(false);
          setStatusMessage('Pace checkpoint done. Notice your breathing and speed.');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaceRunning]);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {
          // Ignore cleanup failures on unmount.
        });
      }
    };
  }, [recording]);

  const handleSavePlan = async () => {
    const keyPoints = keyPointsInput
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!context.trim() || !goal.trim()) {
      setStatusMessage('Add conversation context and goal.');
      return;
    }
    const next = await addConversationPlan({
      context,
      goal,
      keyPoints,
      boundary,
    });
    setState(next);
    setContext('');
    setGoal('');
    setKeyPointsInput('');
    setBoundary('');
    setStatusMessage('Conversation plan saved.');
  };

  const handleSaveDraft = async () => {
    if (!draftContent.trim()) {
      setStatusMessage('Draft is empty.');
      return;
    }
    const next = await addMessageDraft({
      templateType,
      content: draftContent.trim(),
    });
    setState(next);
    setStatusMessage('Draft saved.');
  };

  const handleStartRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setStatusMessage('Microphone permission is required for speech recording.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const nextRecording = new Audio.Recording();
      await nextRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await nextRecording.startAsync();
      setRecording(nextRecording);
      setRecordingUri('');
      setAudioFeedback('');
      setIsRecording(true);
      setStatusMessage('Recording started.');
    } catch (error) {
      setStatusMessage('Unable to start recording.');
    }
  };

  const handleStopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI() ?? '';
      setRecordingUri(uri);
      setStatusMessage(uri ? 'Recording saved. Generate AI feedback next.' : 'Recording ended.');
    } catch {
      setStatusMessage('Unable to stop recording cleanly.');
    } finally {
      setIsRecording(false);
      setRecording(null);
    }
  };

  const handleGenerateAudioFeedback = async () => {
    if (!allowAudioForSession) {
      setStatusMessage('Enable audio sharing for this session before AI analysis.');
      return;
    }
    if (!recordingUri) {
      setStatusMessage('Record audio first.');
      return;
    }
    setIsAnalyzingAudio(true);
    try {
      const feedback = await generateSpeechAudioFeedback({
        recordingUri,
        contextHint: audioContextHint,
      });
      setAudioFeedback(feedback);
      setStatusMessage('AI speech feedback generated.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to generate AI feedback.';
      setStatusMessage(message);
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <Header title="Clear Voice" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Organize before you speak</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Map your intent, prepare language, and pace yourself in difficult conversations.
          </Text>
          <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>{statusMessage}</Text>
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Speech Recording + AI Feedback
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Record a short speaking sample and let Gemini analyze clarity, pacing, and improvement drills.
          </Text>
          <TouchableOpacity
            style={[styles.privacyRow, { borderColor: theme.colors.border }]}
            onPress={() => setAllowAudioForSession((current) => !current)}
            accessibilityRole="switch"
            accessibilityState={{ checked: allowAudioForSession }}
          >
            <View style={styles.privacyCopy}>
              <Text style={[styles.privacyTitle, { color: theme.colors.text }]}>
                Share audio with Gemini this session
              </Text>
              <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>
                {allowAudioForSession
                  ? 'Enabled. Audio can be analyzed until you leave this screen.'
                  : 'Disabled by default. Recording stays local unless you opt in.'}
              </Text>
            </View>
            <View
              style={[
                styles.toggleDot,
                {
                  backgroundColor: allowAudioForSession ? colors.main : theme.colors.border,
                },
              ]}
            />
          </TouchableOpacity>
          <View style={styles.row}>
            {AUDIO_CONTEXT_PRESETS.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setAudioContextHint(item)}
                style={[
                  styles.chip,
                  {
                    borderColor: audioContextHint === item ? colors.main : theme.colors.border,
                    backgroundColor:
                      audioContextHint === item ? colors.light : theme.colors.surface,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: theme.colors.text }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            label="Context hint"
            value={audioContextHint}
            onChangeText={setAudioContextHint}
            placeholder="Weekly check-in update"
          />
          <View style={styles.row}>
            <Button
              title={isRecording ? 'Recording…' : 'Start Recording'}
              onPress={handleStartRecording}
              variant="primary"
              size="md"
              fullWidth
              style={styles.flex}
              disabled={isRecording}
            />
            <Button
              title="Stop Recording"
              onPress={handleStopRecording}
              variant="outline"
              size="md"
              fullWidth
              style={styles.flex}
              disabled={!isRecording}
            />
          </View>
          <Button
            title="Generate Audio Feedback"
            onPress={handleGenerateAudioFeedback}
            variant="outline"
            size="md"
            fullWidth
            loading={isAnalyzingAudio}
            disabled={!recordingUri || !allowAudioForSession}
          />
          {recordingUri ? (
            <Text style={[styles.caption, { color: theme.colors.textTertiary }]}>
              Recording captured: {recordingUri}
            </Text>
          ) : null}
          {audioFeedback ? (
            <View style={styles.previewCard}>
              <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>
                {audioFeedback}
              </Text>
            </View>
          ) : null}
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pre-Conversation Organizer</Text>
          <TextInput label="Context" value={context} onChangeText={setContext} placeholder="Discuss project delays" />
          <TextInput label="Goal" value={goal} onChangeText={setGoal} placeholder="Agree on realistic timeline" />
          <TextInput
            label="Key points (one per line)"
            value={keyPointsInput}
            onChangeText={setKeyPointsInput}
            multiline
          />
          <TextInput
            label="Boundary"
            value={boundary}
            onChangeText={setBoundary}
            placeholder="Need respectful tone and clear next steps"
          />
          <Button title="Save Plan" onPress={handleSavePlan} variant="primary" size="md" fullWidth />
          {(state?.plans ?? []).slice(0, 3).map((plan) => (
            <View key={plan.id} style={styles.previewCard}>
              <Text style={[styles.previewTitle, { color: theme.colors.text }]}>{plan.context}</Text>
              <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>Goal: {plan.goal}</Text>
            </View>
          ))}
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Message Templates</Text>
          <View style={styles.row}>
            {TEMPLATE_TYPES.map((type) => {
              const selected = type === templateType;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setTemplateType(type);
                    setDraftContent(TEMPLATE_MAP[type]);
                  }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.light : theme.colors.surface,
                      borderColor: selected ? colors.main : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: theme.colors.text }]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput value={draftContent} onChangeText={setDraftContent} multiline label="Draft" />
          <Button title="Save Draft" onPress={handleSaveDraft} variant="outline" size="md" fullWidth />
        </Card>

        <Card variant="elevated" padding="lg" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pace Checkpoint</Text>
          <Text style={[styles.timer, { color: theme.colors.text }]}>{formatMMSS(paceSecondsLeft)}</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Practice speaking one idea per breath. Pause after each sentence.
          </Text>
          <View style={styles.row}>
            <Button
              title={isPaceRunning ? 'Restart' : 'Start 2-min Pace'}
              onPress={() => {
                setPaceSecondsLeft(120);
                setIsPaceRunning(true);
              }}
              variant="primary"
              size="md"
              fullWidth
              style={styles.flex}
            />
            <Button
              title="Stop"
              onPress={() => {
                setIsPaceRunning(false);
                setPaceSecondsLeft(120);
              }}
              variant="ghost"
              size="md"
              fullWidth
              style={styles.flex}
            />
          </View>
        </Card>

        <AIFeedbackCard
          toolName="Clear Voice"
          contextSummary={`Conversation plans: ${state?.plans.length ?? 0}. Draft templates: ${state?.drafts.length ?? 0}. Pace timer: ${paceSecondsLeft}s. Status: ${statusMessage}.`}
          presetPrompts={[
            'Suggest clearer wording for a difficult conversation.',
            'Give me a structure for calm assertive speaking.',
            'Create a 2-minute pre-meeting speaking warmup.',
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
  body: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  previewCard: { gap: spacing.xs, backgroundColor: '#ECFEFF', padding: spacing.md, borderRadius: borderRadius.md },
  privacyRow: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  privacyCopy: { flex: 1, gap: spacing.xs },
  privacyTitle: { fontSize: 14, fontWeight: '600' },
  toggleDot: { width: 20, height: 20, borderRadius: borderRadius.full },
  previewTitle: { fontSize: 14, fontWeight: '600' },
  timer: { fontSize: 42, fontWeight: '700', textAlign: 'center' },
  flex: { flex: 1 },
});
