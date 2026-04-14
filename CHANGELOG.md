# Changelog

All notable platform-level changes for this repository are documented here.

## Unreleased

### Added

- Installed Storybook workflow skills from `thebushidocollective/han`:
  - `storybook-story-writing`
  - `storybook-component-documentation`
  - `storybook-args-controls`
  - `storybook-configuration`
- v0.9.0 release-hygiene docs:
  - repo-linking issue pack
  - MVP backlog
  - release backlog index
  - content publish contract
  - Vercel deployment ownership guide

### Changed

- Standardized repo-local GHP workspace config in `.ghp/config.json`
- Documented the production ownership split:
  - `studio.call-indigo.com` via `indigo-studio` and EasyPanel
  - `call-indigo.com` via `website-call-indigo` and Vercel
- Updated deployment and release docs to reflect the real production contract
- Converted legacy Vercel GitHub workflows in this repo to manual lanes so this repo does not implicitly own website production deploys

### Fixed

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
