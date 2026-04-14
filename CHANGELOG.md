# Changelog

All notable platform-level changes for this repository are documented here.

## [0.9.0] - 2026-04-14

### Added

- Production-ready EasyPanel deployment with validated Strapi backend
- Comprehensive health check and endpoint verification systems
- Automated deployment validation and production readiness checks
- GitHub Projects (GHP) integration for release orchestration
- Multi-platform deployment validation (EasyPanel + Vercel)

### Changed

- Standardized production deployment contracts:
  - `studio.call-indigo.com` → EasyPanel (indigo-studio repo) ✅ LIVE
  - `call-indigo.com` → Vercel (website-call-indigo repo) ✅ LIVE
- Enhanced deployment automation with YOLO mode fallbacks
- Improved health endpoint monitoring and validation
- Updated release documentation and checklists

### Fixed

- Resolved EasyPanel service name mismatch (indigo-strapi → indigo-studio)
- Fixed Next.js i18n locale matcher import issues
- Stabilized production deployment workflows
- Corrected health endpoint configurations for both platforms

### Deployment

- **EasyPanel**: ✅ Deployed and validated
  - URL: https://riostack-indigo-studio.ck87nu.easypanel.host
  - Admin: https://riostack-indigo-studio.ck87nu.easypanel.host/manage/admin
  - Status: HTTP 302 → HTTP 200 (operational)

- **Vercel**: ✅ Deployed and validated
  - URL: https://call-indigo.com
  - Status: HTTP 200 (operational)
  - Health API: Functional with monitoring

## Unreleased

- Patched `@bretwardjames/ghp-cli` so `ghp config --show -w` displays repo workspace config correctly instead of reporting an empty workspace
- Restored working `launch-apps` and `launch-apps-open` GHP shortcuts for the shared `launchops` project flow

## 0.0.1

Validated dev baseline for the Strapi-first React platform.

### Added

- GitHub-first delivery model using the existing issue and PR templates
- Project operating standard: every Codex task maps to a GitHub issue and updates that issue on completion
- Small parallel `0.0.x` versioning model for platform increments
- Platform baseline definition for the starter as a reusable Strapi + React foundation
- Backlog tracks for agent framework evaluation, feature flag evaluation, and release tooling evaluation

### Validated

- Strapi remains the CMS and platform core
- Next.js remains the React application layer
- Existing package version fields are the current release-tracking source of truth
- GitHub Issues + Projects v2 is the primary delivery surface
- No additional management layer is required to start parallel work

### Deferred

- `obra/superpowers` installation and integration
- `agency-agents` installation and integration
- Feature flag implementation
- Changesets or other release automation
- Nonessential tooling that adds process overhead before improving throughput
