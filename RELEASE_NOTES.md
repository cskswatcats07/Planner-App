# Release Notes

## Version

- App version: `1.0.1`
- iOS build number: `2`
- Android version code: `2`
- Release date: `2026-02-16`

## Highlights

- Cross-platform polish pass for iOS, iPadOS, Android phones, and Android tablets.
- Full module MVP implementation across Time, Finance, Tasks, Memory, Dopamine, Speech, Thoughts, and Impulse.
- Release hardening for auth deep links, notification UX, and mobile deployment readiness.

## New Features

- Added functional MVP tools across all previously stubbed protected modules.
- Added dev-only deep-link callback validator at `/(protected)/debug-deep-link-test`.
- Added Android release parity scripts and EAS profiles.

## Improvements

- Responsive foundation with shared breakpoints and tablet-safe max-width containers.
- Improved auth OAuth callback handling and deep-link session parsing resilience.
- Improved notification permission messaging and fallback behavior in reminder modules.

## Fixes

- Prevented startup crash when Supabase env vars are missing by handling unconfigured state safely.
- Hardened callback URL parsing to avoid crashes on malformed deep links.
- Improved layout behavior on larger screens where full-width views previously stretched excessively.

## Notes For Testers

- Focus areas:
  - Auth callbacks (email, OAuth, reset links)
  - Notifications (Time nudges, Finance bills, Memory reminders)
  - Tablet layouts (dashboard, explore, auth forms)
- Known limitations:
  - Wearable integrations remain bridge-level stubs for this release.

## Upgrade / Migration Notes

- Version/build bumped to `1.0.1` / iOS `2` / Android `2`.
- No destructive local data migration introduced.
