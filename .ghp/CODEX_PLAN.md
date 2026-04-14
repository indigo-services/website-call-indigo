# v0.9.0 Release Closure And Deploy Recovery Plan

## Summary

Finish `v0.9.0` as a deployment-and-release lane, not a feature lane.

The next execution cycle should do four things in order:
1. normalize release bookkeeping and backlog ownership
2. make the health/status tooling reflect real platform behavior
3. verify and lock the two production control planes
4. cut the `v0.9.0` release record only after those checks are green

Current facts this plan assumes:
- `https://call-indigo.com/` returns `200`, but `https://call-indigo.com/api/health` returns `503`
- `https://studio.call-indigo.com/` and `/manage/admin` return `200`
- `yarn easypanel:status` and the OpenAPI check still fail even though EasyPanel auth/config mostly works
- the accessible Vercel production project is `website-call-indigo`, while this repo’s local `.vercel/project.json` is stale or points at an inaccessible project
- `launchops` is the execution source of truth; local docs are the mirror

## Key Changes

### 1. Use one parent release lane and tighten issue ownership

Keep [#36](https://github.com/indigo-services/indigo-studio/issues/36) as the parent release container and make it the only `v0.9.0` closeout thread.

Use these existing issues as the active execution lanes:
- [#38](https://github.com/indigo-services/indigo-studio/issues/38) for EasyPanel source/deploy verification
- [website-call-indigo#1](https://github.com/indigo-services/website-call-indigo/issues/1) for Vercel production linkage
- [#18](https://github.com/indigo-services/indigo-studio/issues/18) for Vercel link/worktree convention and stale `.vercel/project.json`
- [#16](https://github.com/indigo-services/indigo-studio/issues/16) for Node runtime policy, since the repo still runs mixed Node targets

Create three additional `v0.9.0 foundation` issues under `launchops`:
- `Indigo Studio: align repo health checks with real production routes and success criteria`
- `Indigo Studio: harden Easypanel status/OpenAPI tooling against current panel behavior`
- `Indigo Studio: cut v0.9.0 release record, changelog, tag, and deployment history`

Treat [#24](https://github.com/indigo-services/indigo-studio/issues/24) as historical context only. Do not execute against it directly; either comment that it has been superseded by `#38` + `website-call-indigo#1` or close it once those two are complete. Treat [#25](https://github.com/indigo-services/indigo-studio/issues/25) as closeable cleanup if local `main` remains clean.

### 2. Fix the control-plane metadata before any release tagging

Standardize the repo metadata surfaces:
- `.ghp/config.json` stays the canonical shared GHP config
- `.vercel/project.json` must either point to the actual accessible local-preview project for this repo or be explicitly documented as non-canonical for production
- `docs/deployment/DEPLOYMENT_CHECKLIST.md` becomes the authoritative release gate file
- `docs/RELEASE-BACKLOG.md` and `docs/v0.9.0-mvp-backlog.md` become the local mirror of the `launchops` issue set
- `CHANGELOG.md` becomes the release note draft source, not an afterthought

Explicit local mirror updates required during execution:
- add a `v0.9.0` closeout subsection to `docs/RELEASE-BACKLOG.md`
- append newly discovered blockers and their GitHub issue numbers to the local docs mirror
- record the final production verification result in the `Deployment History` table in `docs/deployment/DEPLOYMENT_CHECKLIST.md`
- move the current `CHANGELOG.md` `Unreleased` notes into a release-ready `0.9.0` section only when deploy verification is complete

### 3. Make health/status tooling match the real platform contract

Do not use the current health commands as release gates until they are corrected.

Required behavior changes:
- `scripts/health-check.mts` must stop assuming Strapi health is always `${apiUrl}/health` and admin is always `/admin`
- `scripts/easypanel-ops.mts` health logic must accept the configured public URL/admin path as first-class inputs and must distinguish:
  - site reachable
  - health endpoint contract missing/broken
  - panel API/status fetch broken
- `yarn easypanel:status` must be resilient to the current API fetch path instead of failing hard on `fetch failed`
- `yarn easypanel:doctor` OpenAPI discovery must degrade to warning if auth/settings/project inspection passes but the spec endpoint is unavailable
- the release gate must use both direct URL checks and command-based checks until the commands are proven trustworthy

Health contract to standardize:
- `call-indigo.com` should have one explicit production health route that returns `200`
- `studio.call-indigo.com` should have one explicit readiness route and one admin route expectation
- the docs and scripts must agree on those exact paths

### 4. Lock production ownership and then cut the release

Production ownership must stay explicit:
- `indigo-services/indigo-studio` owns `studio.call-indigo.com` through EasyPanel
- `indigo-services/website-call-indigo` owns `call-indigo.com` through Vercel
- this repo’s Next app remains local/workbench or preview-only unless intentionally linked otherwise

Execution order for release closeout:
1. complete `#18` so Vercel link metadata and worktree behavior are deterministic
2. complete the new health-contract issue so `doctor`, `health`, and checklist use the same success criteria
3. complete the new Easypanel tooling issue so `status`/OpenAPI checks stop producing false blockers
4. complete `#38` and `website-call-indigo#1` with live proof that:
   - EasyPanel is Git-backed on `main`
   - Vercel production points to `website-call-indigo` `main`
   - both public domains respond successfully
   - the defined health endpoints respond successfully
5. complete the release-record issue:
   - bump version from `0.0.1` to `0.9.0` in this repo
   - finalize `CHANGELOG.md`
   - record deployment history
   - create the Git tag only after live verification
   - close `#36`

## Test Plan

Use these as the required acceptance checks for the implementation lane:

- Repo and workflow:
  - `git status --short --branch`
  - `yarn ghp:config:show`
  - `yarn ghp status`
  - `yarn ghp plan studio-open --json`
  - `yarn ghp plan launch-apps-open --json`

- Local release-tooling checks:
  - `yarn doctor`
  - `yarn easypanel:doctor`
  - `yarn easypanel:status --json`
  - `yarn easypanel:health --json`

- Direct production verification:
  - `Invoke-WebRequest https://call-indigo.com/`
  - `Invoke-WebRequest https://call-indigo.com/<final-health-route>`
  - `Invoke-WebRequest https://studio.call-indigo.com/`
  - `Invoke-WebRequest https://studio.call-indigo.com/manage/admin`
  - optional: direct Strapi readiness route if it is defined separately

- Platform metadata verification:
  - Vercel project lookup for `website-call-indigo`
  - latest production deployment state on Vercel
  - EasyPanel source mode, repo, branch, root path, compose file, and internal service name

## Assumptions And Defaults

- Target release remains `v0.9.0`, not `v1.0`
- GitHub Project `launchops` remains the execution source of truth; local docs mirror it
- No new feature work is part of this lane
- `#18` absorbs `.vercel/project.json` and link-convention cleanup rather than spawning another separate metadata issue
- `#24` should be superseded, not used as the active execution lane
- `CHANGELOG.md` should be finalized as part of the release-record issue, not left uncommitted locally
- `0.9.0` tagging happens only after both production domains and their agreed health routes are verified
