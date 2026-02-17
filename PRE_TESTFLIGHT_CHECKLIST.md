# Pre-Release Checklist (iOS + Android)

Use this checklist before creating or submitting production iOS and Android builds.

## Build And Versioning

- [ ] `app.json` has correct `expo.version` and iOS `buildNumber`
- [ ] `app.json` has correct Android `versionCode`
- [ ] `eas.json` production profile is configured and `autoIncrement` is enabled
- [ ] `npm run build:ios:production` succeeds
- [ ] `npm run build:android:production` succeeds

## Environment And Secrets

- [ ] Local `.env` contains valid production Supabase values
- [ ] `.env.example` contains placeholders only (no real keys)
- [ ] No secrets are committed in git history or staged files

## Authentication And Deep Linking

- [ ] Email/password sign-in and sign-up work on iPhone
- [ ] Email/password sign-in and sign-up work on Android phone
- [ ] Google sign-in works and returns to app correctly
- [ ] Apple sign-in works and returns to app correctly
- [ ] Password reset email opens app link and auth flow behaves correctly
- [ ] App scheme in `app.json` matches configured redirect URIs

## Notifications

- [ ] Notification permission prompt appears correctly
- [ ] User can continue gracefully when permission is denied
- [ ] Time module push nudge behavior works on device
- [ ] Finance bill reminder notifications trigger as expected
- [ ] Memory reminder notifications trigger as expected
- [ ] Notification behavior is validated on both iOS and Android

## Content And Compliance

- [ ] Privacy Policy URL is public and final
- [ ] Terms of Service URL is public and final
- [ ] Medical disclaimer wording is reviewed
- [ ] Age-gate and consent copy reviewed for release
- [ ] App Store privacy answers are prepared

## UX And Quality

- [ ] Main flows tested: assessment, auth, dashboard, all module tools
- [ ] Protected-route redirect behavior works when signed out
- [ ] No blocking runtime errors in Xcode/Expo device logs
- [ ] No blocking runtime errors in Android Studio/adb logs
- [ ] Dark mode UI remains readable on all key screens
- [ ] Basic accessibility checks complete (tap target size, labels, contrast)
- [ ] Device matrix pass: iPhone + iPad + Android phone + Android tablet

## App Store Connect

- [ ] App metadata complete (subtitle, description, keywords, support URL)
- [ ] App screenshots prepared for required iPhone sizes
- [ ] App icon/splash assets finalized
- [ ] TestFlight internal testing pass completed
- [ ] `npm run submit:ios:production` executed (or manual submission complete)

## Google Play

- [ ] Play Console store listing complete (description, graphics, support URL)
- [ ] Privacy policy URL configured
- [ ] Internal testing pass completed
- [ ] `npm run submit:android:production` executed (or manual submission complete)
