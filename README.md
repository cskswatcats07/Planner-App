# MindPilot Foundation MVP

MindPilot is an Expo + React Native app targeting web, iOS, and Android from a
single codebase. This repository contains the foundation MVP scaffold, including
assessment flow, authentication screens, protected dashboard/module stubs,
privacy/legal stubs, and Supabase schema migrations.

## Stack

- Expo + Expo Router
- React Native + React Native Web
- Zustand
- Supabase (`@supabase/supabase-js`)
- AsyncStorage + Secure Store

## Setup

1. Install dependencies:
   - `npm install`
2. Copy env template:
   - `copy .env.example .env` (Windows)
3. Fill your Supabase project values in `.env`.
4. Add Gemini values for AI feedback:
   - `EXPO_PUBLIC_GEMINI_API_KEY`
   - `EXPO_PUBLIC_GEMINI_MODEL` (recommended: `gemini-2.0-flash`)
   - optional: `EXPO_PUBLIC_GEMINI_MODEL_FALLBACKS` (comma-separated models)
5. Run the app:
   - `npm run start`
   - `npm run web` (for web)

## Mobile Deployment Readiness

This project is configured for EAS Build and release delivery for iOS and Android.

### One-time setup

1. Install EAS CLI and log in:
   - `npm install -g eas-cli`
   - `eas login`
2. Confirm app config in `app.json`:
   - iOS bundle ID: `com.mindpilot.app`
   - iOS build number: `1` (auto-increments in production profile)
   - Android package: `com.mindpilot.app`
   - Android version code: `1`
3. Ensure `.env` contains valid Supabase keys (do not use `.env.example` directly).

### Build commands

- Preview/internal iOS build:
  - `npm run build:ios:preview`
- Production iOS build:
  - `npm run build:ios:production`
- Submit production build:
  - `npm run submit:ios:production`
- Preview/internal Android build:
  - `npm run build:android:preview`
- Production Android build:
  - `npm run build:android:production`
- Submit production Android build:
  - `npm run submit:android:production`

### Store checklists

- App icon, splash, and metadata finalized
- Privacy Policy and Terms URLs available publicly
- Sign in providers configured in Supabase + Apple/Google developer setups
- Push notification behavior verified on physical iOS and Android devices
- TestFlight + Play internal QA passes completed

## Supabase Schema

Migrations are in `supabase/migrations`:

- `001_users_profile.sql`
- `002_assessment_results.sql`

Seed file:

- `supabase/seed.sql`

## Foundation Scope Included

- Calm design system tokens and base UI components
- Public assessment flow with locally stored results
- Supabase-auth powered login, signup, and reset screens
- Protected route guard and dashboard
- Eight module stub screens
- Settings page with privacy/export/delete placeholders
- Privacy policy, terms of service, and medical disclaimer stubs
- Wearable abstraction contracts in `lib/wearables.ts`
