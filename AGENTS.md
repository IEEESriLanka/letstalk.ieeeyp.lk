# Development Guidelines

## Project Overview

This repository contains the **IEEE LETs Talk** frontend application, built with TanStack Start, React, Vite, TypeScript, and Tailwind CSS.

## Key Conventions

- **Routing**: File-based routing located under `src/routes/`. The root shell and layout are in `src/routes/__root.tsx`.
- **Styling**: Tailwind CSS v4 configured via `@tailwindcss/vite` and `src/styles.css`.
- **Components**: UI components in `src/components/ui/` and site sections in `src/components/site/`.
- **Development**: Run `npm run dev` to start the local development server on port 8080.
- **Production Build**: Run `npm run build` to create the production client and SSR bundle.

## Production Reliability Rules (Required)

This is a continuously updated live site. Preserve the working production
deployment while developing. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for releases
and recovery. Never promise that a build check guarantees zero downtime.

### Development and review

- Work on a feature/fix branch and submit a pull request. Do not push unfinished
  work directly to the production branch or force-push shared branches.
- Keep changes focused and independently reversible. Separate dependency,
  deployment, authentication, and database changes from visual/content updates.
- Before editing, inspect the existing code and working-tree changes. Preserve
  unrelated work. Do not rewrite the application to solve a small issue.
- Review all changed paths and callers. For changed user flows, check loading,
  empty, error, mobile, and unauthenticated behavior as applicable.
- Run lint/type checks relevant to the changes. Existing repository-wide type
  errors are technical debt, not permission to add new errors. Do not disable
  strictness, add broad ignores, or weaken checks to make an update pass.
- Every completed change must report what changed, exact checks and results,
  limitations, environment changes, and how to revert it.

### Build and runtime invariants

- Before proposing a release, run `npm run build:vercel`. A successful local dev
  session or ordinary Vite compilation is insufficient evidence for Vercel.
- Keep the `Vercel build and runtime / Vercel runtime` CI check passing.
- Preserve Nitro's Vercel preset and `inlineDynamicImports: true`. This prevents
  the reproduced CSRF initialization cycle. Changing this setting, the Vite
  plugin order, server entry, Start middleware, or bundler requires a targeted
  regression check and a verified Vercel Preview cold start.
- Keep CSRF protection enabled in `src/start.ts`. Never remove security checks
  to fix a deployment or change a failing smoke check to accept HTTP 500.
- Preserve `postbuild` and `scripts/check-server-build.mjs`. The check must load
  the actual built Vercel function, render login, reject cross-site server calls,
  and fail the build on errors. Extend coverage for new critical flows.
- Do not configure this SSR application as a static `dist` deployment. Preserve
  `.vercel/output` generation, server functions, and deep-link routing.
- Use `npm ci` for clean verification and CI. Commit `package-lock.json` with
  intentional dependency changes. Do not regenerate the lockfile incidentally.
- Upgrade TanStack, Vite, Nitro, React, or Node in a separate PR. Check compatible
  versions, dependency patches, clean installation, the Vercel build, and Preview
  runtime before release. Keep CI and Vercel on the same Node major (24).

### Data, secrets, and compatibility

- Never commit secrets, print environment values, or expose server secrets via
  `VITE_*`. Document required variable names and target environments.
- Test changes against non-production data. Do not run destructive migrations,
  bulk edits, or test messages against production as part of a build or smoke test.
- Database/API changes must support both the currently deployed and next version.
  Add compatible fields first, migrate safely, and remove old fields only in a
  later release after rollback compatibility is no longer needed.
- Failure of optional email, analytics, or third-party features must not crash
  public pages. Provide bounded requests and useful error/fallback behavior.

### Release and recovery

- Verify a Vercel Preview for the exact final commit before release: direct page
  loads, refreshes, assets, public content, login/logout, and affected CMS/forms.
  Verify browser errors and Vercel runtime logs; avoid production write tests.
- Record the previous working production deployment URL/ID and commit before
  switching traffic. Keep it available for rollback.
- CI and Preview success do not authorize a production deployment. Follow the
  user's existing deployment authorization; do not invent extra approval steps.
- After release, verify the production URLs and logs. For a new critical 5xx,
  broken login, or inaccessible core pages, restore the previous working
  deployment promptly under the applicable release authorization, then fix on
  a branch. Do not leave production broken while experimenting.
- Repository files cannot enforce GitHub branch protection, Vercel deployment
  checks, staged promotion, or monitoring. State clearly when these external
  controls have not been configured; do not claim they are active.
