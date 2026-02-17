import * as FileSystem from 'expo-file-system';

const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-2.0-flash';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_VERSIONS = ['v1beta', 'v1'] as const;
const DEFAULT_MODEL_FALLBACKS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];
const GEMINI_MODEL_FALLBACKS = (process.env.EXPO_PUBLIC_GEMINI_MODEL_FALLBACKS ?? '')
  .split(',')
  .map((item: string) => item.trim())
  .filter(Boolean);

export interface ToolFeedbackResult {
  summary: string;
  strengths: string[];
  improvements: string[];
  promptSuggestions: string[];
}

function assertGeminiConfigured(): void {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'Gemini API key missing. Add EXPO_PUBLIC_GEMINI_API_KEY to .env.'
    );
  }
}

function extractTextResponse(payload: any): string {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part?.text ?? '')
      .join('\n')
      .trim() ?? ''
  );
}

function safeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function parseToolFeedback(text: string): ToolFeedbackResult {
  const fallback: ToolFeedbackResult = {
    summary: text || 'No feedback generated.',
    strengths: [],
    improvements: [],
    promptSuggestions: [],
  };

  try {
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx < 0 || endIdx <= startIdx) return fallback;
    const parsed = JSON.parse(text.slice(startIdx, endIdx + 1));
    return {
      summary:
        typeof parsed.summary === 'string' ? parsed.summary : fallback.summary,
      strengths: safeArray(parsed.strengths),
      improvements: safeArray(parsed.improvements),
      promptSuggestions: safeArray(parsed.promptSuggestions),
    };
  } catch {
    return fallback;
  }
}

function uniqueModels(models: string[]): string[] {
  return Array.from(new Set(models.filter(Boolean)));
}

function buildGeminiEndpoint(model: string, version: (typeof GEMINI_VERSIONS)[number]): string {
  return `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

async function callGemini(contents: any[]): Promise<string> {
  assertGeminiConfigured();
  const modelCandidates = uniqueModels([
    GEMINI_MODEL,
    ...GEMINI_MODEL_FALLBACKS,
    ...DEFAULT_MODEL_FALLBACKS,
  ]);
  const attempts: string[] = [];

  for (const model of modelCandidates) {
    for (const version of GEMINI_VERSIONS) {
      const endpoint = buildGeminiEndpoint(model, version);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.4,
          },
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        return extractTextResponse(payload);
      }

      const message = await response.text();
      attempts.push(`${model}@${version}:${response.status}`);
      if (response.status === 404) {
        continue;
      }

      throw new Error(
        `Gemini request failed (${response.status}) using ${model}@${version}: ${message}`
      );
    }
  }

  throw new Error(
    `No compatible Gemini model found for this API key. Tried: ${attempts.join(
      ', '
    )}. Set EXPO_PUBLIC_GEMINI_MODEL to a supported model (for example: gemini-2.0-flash).`
  );
}

export async function generateToolFeedback(input: {
  toolName: string;
  contextSummary: string;
  userPrompt?: string;
}): Promise<ToolFeedbackResult> {
  const instruction =
    'You are a supportive productivity coach. Return JSON only with keys: summary (string), strengths (string[]), improvements (string[]), promptSuggestions (string[]). Keep each list to max 3 concise bullets.';

  const question = input.userPrompt?.trim()
    ? `User ask: ${input.userPrompt.trim()}`
    : 'Give practical feedback and next prompts.';

  const text = await callGemini([
    {
      role: 'user',
      parts: [
        {
          text: `${instruction}\nTool: ${input.toolName}\nContext:\n${input.contextSummary}\n${question}`,
        },
      ],
    },
  ]);

  return parseToolFeedback(text);
}

function inferMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.m4a')) return 'audio/mp4';
  if (lower.endsWith('.aac')) return 'audio/aac';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.3gp')) return 'audio/3gpp';
  return 'audio/mp4';
}

export async function generateSpeechAudioFeedback(input: {
  recordingUri: string;
  contextHint?: string;
}): Promise<string> {
  assertGeminiConfigured();
  const base64Audio = await FileSystem.readAsStringAsync(input.recordingUri, {
    encoding: 'base64',
  });

  const text = await callGemini([
    {
      role: 'user',
      parts: [
        {
          text: `You are a speech coach. Analyze the provided audio and give concise actionable feedback on clarity, pacing, filler usage, and confidence. Include 3 drills for improvement. Context: ${
            input.contextHint ?? 'general communication'
          }`,
        },
        {
          inlineData: {
            mimeType: inferMimeType(input.recordingUri),
            data: base64Audio,
          },
        },
      ],
    },
  ]);

  return text || 'No audio feedback generated.';
}
