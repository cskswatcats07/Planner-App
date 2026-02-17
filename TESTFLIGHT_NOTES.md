# TestFlight Notes

## Build Info

- Version: `1.0.1`
- Build: `2`
- Environment: `production-like` (Supabase project configured for test)

## What To Validate

1. Auth and deep links
   - Email sign up/sign in
   - Google/Apple OAuth return to app
   - Password reset link return path
2. Notifications
   - Time module nudges
   - Finance bill reminders
   - Memory reminders
3. Core module workflows
   - Time, Finance, Tasks, Memory, Dopamine, Speech, Thoughts, Impulse

## Suggested Test Accounts

- Account A: `<email>`
- Account B: `<email>`

## Known Issues / Caveats

- Wearable integrations are interface stubs in this phase.
- Some module experiences are MVP and intentionally lightweight.

## Feedback Format

When reporting an issue, include:

- Device model + iOS version
- Build number
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshot/screen recording (if possible)
