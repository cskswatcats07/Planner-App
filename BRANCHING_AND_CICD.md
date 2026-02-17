# Branching and CI/CD Guide

## Branch Strategy

- `dev`: integration branch for active development
- `uat`: stabilization branch for UAT and release candidate validation
- `production`: release branch for production deployments

## Promotion Flow

1. Feature branches branch off `dev`.
2. Pull request into `dev` (CI required).
3. Promote `dev` -> `uat` via PR after QA readiness.
4. Promote `uat` -> `production` via PR after UAT sign-off.
5. Tag production releases (example: `v1.0.2`) after merge.

## GitHub Branch Protection (Recommended)

Configure for `dev`, `uat`, `production`:

- Require pull request before merging.
- Require status checks to pass:
  - `Quality Gate`
- Require up-to-date branches before merge.
- Require at least 1 approval on `dev`, 2 approvals on `uat` and `production`.
- Restrict direct pushes.
- Enable signed commits if your org requires it.

## Environments and Secrets

Create GitHub environments:

- `uat`
- `production`

Add repository/environment secrets:

- `EXPO_TOKEN`: token used by `eas-cli` in CI.

Optional hardening:

- Add required reviewers on `production` environment.
- Add wait timer before production deployment.

## Workflows Added

- `.github/workflows/ci.yml`
  - Runs on PRs and pushes to `dev`, `uat`, `production`.
  - Installs dependencies and runs `npm run release:check`.

- `.github/workflows/cd-eas.yml`
  - Runs EAS preview builds on `uat`.
  - Runs EAS production builds on `production`.
  - Supports manual trigger via `workflow_dispatch`.

## First-Time Setup Checklist

1. Add remote repository (`origin`) if not configured.
2. Push all branches:
   - `git push -u origin dev`
   - `git push -u origin uat`
   - `git push -u origin production`
3. Configure branch protection rules in GitHub.
4. Create environments and secrets.
5. Run first PR into `dev` and verify CI.
