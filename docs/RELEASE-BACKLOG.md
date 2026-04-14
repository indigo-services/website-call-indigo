# Release Backlog

## Baseline

`0.0.1` is the validated dev baseline for this Strapi-first React platform.

This means:

- the starter is treated as generic platform groundwork
- GitHub is the single source of truth for backlog and task visibility
- every Codex task maps to a GitHub issue and updates that issue on completion
- small parallel `0.0.x` releases are the default delivery model

## Current Operating Standard

- reuse the existing Strapi + Next repo structure first
- reuse native stack capability before adding tooling
- keep one shared platform version line until separate cadence is clearly needed
- keep new process overhead out unless it improves throughput immediately

## `0.0.1` Task List

- define `0.0.1` as the validated dev baseline
- use GitHub Issues + Projects v2 as the delivery surface
- standardize issue-linked Codex task completion
- use small parallel `0.0.x` versions for narrow follow-up releases
- confirm the starter is a reusable platform foundation, not a one-off demo
- move agent frameworks, feature flags, and release tooling into evaluation backlog

## v0.9.0 MVP

The v0.9.0 line is the first branded INDIGO Studio foundation release.

Scope for this release is defined in [v0.9.0 MVP Backlog](./v0.9.0-mvp-backlog.md).

This release should lock:

- repo, git, env, and deploy control surfaces
- local, preview, and prod command parity
- Strapi, Next, Vercel, and Easypanel wiring
- GHP-backed issue and worktree flow for parallel slices
- only the minimum reusable platform shell needed for future modules

## Backlog Tracks

### Agent Framework Evaluation

- evaluate `obra/superpowers` for Codex fit and operating cost
- evaluate `agency-agents` for overlap, constraints, and maintenance burden
- do not install either until evaluation produces a clear win

### Feature Flag Evaluation

- decide whether feature flags belong in Strapi content, app config, or a dedicated service
- do not implement a feature flag system from this baseline release

### Release Tooling Evaluation

- assess Changesets only if manual `0.0.x` release flow becomes a bottleneck
- keep existing package versions as the release-tracking source of truth for now

## Acceptance

`0.0.1` is complete when these operating rules are accepted as the platform baseline and future work is tracked against them.
