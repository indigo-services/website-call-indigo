# Changelog

All notable platform-level changes for this repository are documented here.

## Unreleased

### Added

- Installed Storybook workflow skills from `thebushidocollective/han`:
  - `storybook-story-writing`
  - `storybook-component-documentation`
  - `storybook-args-controls`
  - `storybook-configuration`

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
