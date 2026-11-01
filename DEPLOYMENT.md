# Keeping the live site available

Develop on branches, validate an isolated Preview, and release only a verified
commit. Keep the previous working deployment available. These measures reduce
outage risk; they cannot guarantee uninterrupted hosting or third-party services.

## Automated repository checks

Run `npm ci` in a clean checkout, then `npm run build:vercel`.
The latter works in PowerShell and Unix shells, selects Nitro's Vercel preset,
and runs the built function in a fresh process. It verifies a rendered admin login
page (HTTP 200) and rejected cross-site server-function requests (HTTP 403).
It does not log in, change data, send email, or contact a real server function.

The GitHub workflow `.github/workflows/vercel-runtime.yml` runs these checks on
pull requests, pushes to `main`, and manual dispatch, using Node 24 on Linux.
Vercel's `npm run build` also runs the runtime check through `postbuild`.
Keep that build command in the Vercel project. Do not override it with `vite build`,
which bypasses the npm lifecycle check.

The smoke check covers server initialization and CSRF, not every route, browser
interaction, database permission, or production credential. Existing TypeScript
errors remain separate technical debt; this workflow is not a clean type-check
certification. Do not introduce new errors or relax TypeScript settings.

## One-time external settings

These require changes in GitHub/Vercel and are **not configured by this file**:

1. Protect the actual production branch (currently expected to be `main`): require
   a pull request, review, and the `Vercel runtime` status check before merging;
   block force pushes and deletion. Match the check as it appears in GitHub after
   the first workflow run. Restrict bypasses as appropriate for the maintainers.
2. Confirm Vercel's production branch, repository root, `npm ci` install command,
   `npm run build` build command, and Node 24 runtime. Leave the output directory
   to Nitro; do not override it to `dist`.
3. Enable Preview deployments for feature branches. Set Preview credentials for
   an isolated test backend; verify production variables separately. Do not give
   automated PR checks production secrets.
4. Configure deployment checks or staged production promotion so merging/building
   alone does not switch production traffic before validation. GitHub CI status
   by itself does not prevent Vercel from automatically promoting a Git build.
   Choose a supported control for the project's Vercel plan and verify it once.
5. Configure uptime monitoring for the homepage and login, plus alerts for new
   runtime 5xx errors. Assign a maintainer to receive alerts and perform rollback.

Until these settings are confirmed, repository checks are available but the full
release gate is not enforced. A successful build can still have functional bugs.

## Each update

1. Start a feature/fix branch. Keep deployment/dependency changes separate from
   ordinary content and layout changes. Preserve unrelated working-tree changes.
2. Check changed behavior locally and run `npm run build:vercel`. Check relevant
   lint/types, and add meaningful regression coverage for changed critical flows.
3. Open a PR and wait for the GitHub check and Vercel Preview. Test the final
   commit's Preview with direct loads and refreshes of `/`, `/team`, `/events`,
   `/gallery`, and `/admin/login`. Check mobile layout, navigation, images, console
   errors, and Vercel runtime logs. Test login/logout, affected CMS actions, uploads,
   and contact delivery using test accounts/data when those areas change.
4. Document environment variable names, compatible data changes, and rollback.
   Record the current working production deployment URL/ID and Git commit.
5. Release under the existing deployment authorization only after checks pass.
   Preview and Production may use different environment variables. For staged
   production, test the production-configured deployment before assigning the
   live domain; confirm the tested artifact/commit is the one receiving traffic.
6. After traffic switches, check the live homepage, login, affected routes, assets,
   and runtime logs. Monitor immediately after release. Record the deployment URL,
   commit, validation result, and previous working deployment in the PR/release.

For a framework/runtime upgrade, additionally verify a clean install, dependency
patches in `scripts/patch-dependencies.js`, compatible package versions, cold-start
requests, server functions, and database/auth flows on Preview. Keep the lockfile.
Do not remove `inlineDynamicImports: true` without proving that the server-entry
initialization cycle is fixed and keeping regression coverage.

## Recovery

If a release introduces critical 5xx errors, failed login, or inaccessible core
pages, use Vercel's deployment controls to restore the recorded working production
deployment under the applicable release authorization. Verify the live domain and
logs after rollback. A Git revert alone is not an immediate traffic rollback.

Do not delete the working rollback deployment. Fix the failed change on a branch,
re-run validation, and release again. A deployment rollback does not restore data
or external settings; schema/API changes must remain compatible with the previous
application. Restore data only through a separately reviewed recovery plan.

Official references: [deployment promotion](https://vercel.com/docs/deployments/promoting-a-deployment),
[deployment checks](https://vercel.com/docs/deployment-checks), and
[Instant Rollback](https://vercel.com/docs/instant-rollback).
