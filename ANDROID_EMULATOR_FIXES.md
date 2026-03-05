# Android Emulator & iOS/iPad Notes

## Android configuration (`app.json`)

- `supportsTablet: true` for tablet layout support
- Deep link scheme: `mindpilot` for auth redirects

## Running on Android

### Expo Go (quick test)

1. Start Android emulator (e.g. Pixel 3a API 30).
2. Run: `npm run android` or `npx expo start --android`
3. With cache issues: `npm run android:clear` or `npx expo start --android --clear`

### Development / production build (Android SDK)

For a standalone APK or AAB (Google Play):

1. Install EAS CLI: `npm install -g eas-cli` and `eas login`
2. Preview (internal) build: `npm run build:android:preview`
3. Production build: `npm run build:android:production`
4. Run locally with native Android SDK: `npx expo prebuild` then `npx expo run:android` (requires Android Studio / SDK)

## iOS configuration

- `requiresFullScreen: false` → iPad multitasking/split screen
- `supportsTablet: true` → iPad support

## Known warnings (non-blocking)

- **expo-notifications**: Push in Expo Go is limited in recent SDKs; use a development build for full push.
- **expo-av**: Consider `expo-audio` / `expo-video` in SDK 54+ when available.
