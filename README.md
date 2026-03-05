# MindPilot

MindPilot is a personal organization and daily life management app built with Expo and React Native. It targets **web**, **iOS**, and **Android** from a single codebase. The app helps users understand their challenges via a self-assessment, discover personalized tools, and track various aspects of daily life—including prescriptions and nutrition—through a privacy-focused design.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 54, React Native 0.81 |
| Routing | Expo Router (file-based) |
| State | Zustand |
| Backend / Auth | Supabase (`@supabase/supabase-js`) |
| Local Storage | AsyncStorage, Secure Store |
| AI Feedback | Google Gemini API (optional) |

---

## Project Structure

```
Planner-App/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout, auth init, deep links
│   ├── index.tsx           # Home (public)
│   ├── (auth)/             # Login, Signup, Forgot Password
│   ├── (public)/           # Explore, Tour, FAQ, Tools Customize, Assessment
│   └── (protected)/        # Dashboard, 8 tools, Health, Settings
├── components/
│   ├── ai/                 # AIFeedbackCard
│   ├── assessment/         # QuestionCard, LikertScale, RadarChart, CategoryChart
│   ├── layout/             # Header, SafeAreaWrapper, ModuleStubScreen
│   └── ui/                 # Button, Card, TextInput, ProgressBar
├── constants/              # Modules, assessment questions, disclaimers
├── lib/                    # Auth, Supabase, storage, tools (finance, tasks, etc.)
├── store/                  # authStore, assessmentStore, toolStore
├── theme/                  # Colors, spacing, typography, responsive
├── types/                  # Assessment, modules, user
├── supabase/
│   └── migrations/         # SQL migrations (001–004)
└── server/                 # Example health export route (Express)
```

---

## Features Implemented

### 1. Authentication

- **Sign In** (email/password, Google, Apple OAuth)
- **Sign Up** (email/password with redirect)
- **Forgot Password** (dedicated screen; Supabase `resetPasswordForEmail`)
- **Deep links** (`mindpilot://`) for auth callbacks
- **Protected routes** redirect unauthenticated users to login
- **Auth init timeout** (8s) so the app doesn’t hang on slow Supabase

### 2. Self-Assessment

- **Quick Assessment** – 8 questions (1 per category), ~2–3 minutes
- **Detailed Assessment** – 24 questions (3 per category), ~5–7 minutes
- **Likert scale** (1–5) per question
- **8 categories**: Time Awareness, Money Management, Task Prioritization, Memory & Recall, Motivation & Engagement, Communication, Thought Management, Impulse Management

**Scoring & Recommendations**

- Category score = sum of answers ÷ (questions × 5)
- `recommendedModules` = categories with score ≥ 50%, sorted by score (highest first)
- Results stored locally (AsyncStorage); no server sync for assessment

**Result Gating**

- **Summary** (top 3 challenge areas) – visible without account
- **Full charts** (Radar, CategoryChart) and “Recommended For You” – require sign-in

### 3. Tools (8 Modules)

| ID | Name | Route | Features |
|----|------|-------|----------|
| timeBlindness | Time Awareness | `/(protected)/time-blindness` | Timers, nudge reminders, time estimation |
| finance | Money Manager | `/(protected)/finance` | Expenses, weekly budget, bill reminders |
| tasks | Task Pilot | `/(protected)/tasks` | Task breakdown, Top 3 focus, priority quadrants |
| memory | Remember Well | `/(protected)/memory` | Quick captures, reminders |
| dopamine | Motivation Boost | `/(protected)/dopamine` | Activation prompts, energy modes |
| speech | Clear Voice | `/(protected)/speech` | Conversation plans, message drafts, pace timer, audio feedback |
| thoughts | Thought Organizer | `/(protected)/thoughts` | Thought capture, wind-down reflection |
| impulse | Pause & Reflect | `/(protected)/impulse` | Pause timer, if-then plans, impulse logging |

Each tool uses local storage (lib modules) and, where configured, **AI Feedback** (Gemini) via `AIFeedbackCard`.

### 4. Tool Customization & Recency

- **Customize Tools** (`/(public)/tools-customize`) – show/hide, pin to top
- **Recency tracking** – recently used tools surface first on home
- **Home tools grid** – compact, no scrolling; tools ordered by pinned + last used

### 5. Health Module (Separate from Tools)

- **Health Dashboard** (`/(protected)/health`) – separate card on Dashboard
- **Explicit consent** – “I understand and agree” before first use; timestamp stored locally
- **Health passphrase** – user-defined; used for encryption key derivation (never stored)

**Prescription Management** (all optional except when alerts enabled)

- medication_name, DIN, prescribing_doctor, pharmacy_name, prescription_number
- dosage_text (free text), notes
- renewal_date, renewal_alert_enabled, renewal_alert_days_before (required when alerts on)

**Nutrition Tracking** (all optional)

- daily_weight, goal_weight, calorie_target, protein_target, hydration_target
- meal_plan_name, meal_prep_notes
- meals (array: meal_name, calories, protein, carbs, fats, notes)
- mood_score, focus_score

**Export**

- “Export encrypted JSON” – calls `GET /health/export` for encrypted blobs

**Note:** Health data is designed for a separate backend with field-level encryption. The client uses `lib/healthApi.ts` and `EXPO_PUBLIC_HEALTH_API_URL`. The `server/healthExportRoute.ts` is an example Express route; the full backend and DB schema must be deployed separately.

### 6. Guided Tour & FAQ

- **Quick Tour** (`/(public)/tour`) – 4 cards explaining assessment, tools, customization, notifications
- **FAQs** (`/(public)/faq`) – account requirements, tool customization, notifications, medical disclaimer
- Linked from home (“Take a 30-second tour”) and Settings (“FAQs”)

### 7. Legal & Disclaimers

- **Privacy Policy** (`/(public)/privacy-policy`)
- **Terms of Service** (`/(public)/terms-of-service`)
- **Medical Disclaimer** (`/(public)/medical-disclaimer`)
- Inline disclaimers on assessment and health screens

### 8. Settings

- Privacy controls (export placeholder, delete local assessment data)
- Legal links (Privacy, Terms, Medical Disclaimer, FAQs)
- Sign Out

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
EXPO_PUBLIC_GEMINI_MODEL=gemini-2.0-flash
EXPO_PUBLIC_GEMINI_MODEL_FALLBACKS=gemini-1.5-flash-latest,gemini-1.5-flash
```

Optional:

- `EXPO_PUBLIC_HEALTH_API_URL` – base URL for Health API (prescriptions, nutrition, export)

### Supabase Setup

1. **Authentication**
   - Enable Email and (optionally) Google/Apple
   - Add redirect URL: `mindpilot://reset-password`
   - Enable “Confirm email” if required

2. **Database**
   - Run migrations in order: `001_users_profile.sql`, `002_assessment_results.sql`, `003_rls_policies.sql`, `004_extended_schema.sql`
   - Note: Migration 003 references `user_profiles`; ensure your schema matches (or create the table if using the full health/RLS design).

---

## Supabase Schema

| Migration | Description |
|-----------|-------------|
| 001 | `profiles` – user profile, assessment_completed, preferred_modules |
| 002 | `assessment_results` – user_id, category_scores, recommended_modules |
| 003 | RLS policies, `handle_new_user` trigger (expects `user_profiles`) |
| 004 | `module_progress`, `push_tokens` with RLS |

---

## Running the App

```bash
npm install
copy .env.example .env   # Windows
# Edit .env with your Supabase and Gemini keys
npm run start
```

Platform-specific:

- **Web:** `npm run web`
- **Android (Expo Go):** `npm run android`
- **Android (clear cache):** `npm run android:clear`
- **iOS:** `npm run ios` (macOS only)

---

## Building for Production

### Android APK (installable on any Android device)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview-android
```

Download the APK from the EAS build page.

### EAS Build Commands

| Command | Description |
|---------|-------------|
| `npm run build:ios:preview` | Preview iOS build |
| `npm run build:ios:production` | Production iOS |
| `npm run build:android:preview` | Preview Android APK |
| `npm run build:android:production` | Production Android AAB |
| `npm run submit:ios:production` | Submit to App Store |
| `npm run submit:android:production` | Submit to Play Store |

---

## Key Files

| Purpose | Path |
|---------|------|
| Root layout, auth init | `app/_layout.tsx` |
| Home (tools grid, CTAs) | `app/index.tsx` |
| Assessment store | `store/assessmentStore.ts` |
| Tool ordering & preferences | `store/toolStore.ts` |
| Auth store | `store/authStore.ts` |
| Health API client | `lib/healthApi.ts` |
| AI feedback (Gemini) | `lib/gemini.ts` |
| Tool modules | `lib/finance.ts`, `lib/tasks.ts`, etc. |
| Modules list | `constants/modules.ts` |
| Assessment questions | `constants/assessment-questions.ts` |

---

## Architecture Notes

- **Assessment recommendations** – rule-based (categories ≥ 50% score); no ML.
- **AI feedback** – Gemini for tool context (e.g. Time, Tasks, Speech); not driven by assessment.
- **Health** – separate from the 8 tools; uses its own API and encrypted backend.
- **Planning** – user-created only (conversation plans, if-then plans); no auto-generated plans from assessment.
- **Responsive** – breakpoints for tablet (768px, 1024px) via `theme/responsive.ts`.

---

## Documentation

- `ANDROID_EMULATOR_FIXES.md` – Android/iOS emulator notes, build tips
