# Go-Live Runbook (AI-auto + AI-assist kickoff)

This runbook tracks only items we can automate now (`AI-auto`) and items we can prepare/drive with operator approvals (`AI-assist`).

## AI-auto (implemented)

- [x] Version/build bump completed (`1.0.1`, iOS build `2`, Android version code `2`)
- [x] Release notes draft generated: `RELEASE_NOTES.md`
- [x] TestFlight notes updated: `TESTFLIGHT_NOTES.md`
- [x] Release preflight checks script added: `scripts/release-preflight.mjs`
- [x] Automated release check command added: `npm run release:check`

## AI-assist (prepared, operator-executed)

### Supabase production health and policy verification

Use these commands with your production project access:

1. Verify migration status:
   - `supabase link --project-ref <prod-ref>`
   - `supabase migration list`
2. Verify RLS/policies:
   - Run SQL checks against production (`profiles`, `assessment_results`, module tables)
3. Capture audit summary in release notes.

### EAS builds and submissions

Build commands:

- iOS production build: `npm run build:ios:production`
- Android production build: `npm run build:android:production`

Submit commands:

- iOS submit: `npm run submit:ios:production`
- Android submit: `npm run submit:android:production`

## Execution Order

1. `npm run release:check`
2. iOS/Android production builds
3. Device smoke on generated artifacts
4. Store submissions

## Out of Scope (human-only for now)

- Legal signoff text decisions
- App Store Connect / Play Console manual metadata and policy attestations
- Final go/no-go governance decision
