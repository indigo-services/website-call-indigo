# GitHub GHP Workflow

## Purpose

This repo uses GitHub as the source of truth for planning, PR delivery, and release traceability.

`ghp` is the local collaboration layer for:

- project board views
- issue creation
- issue-scoped worktrees
- branch-to-issue linking
- draft PR execution flow

## Canonical Surfaces

- GitHub issue: scope, acceptance criteria, blockers, and approval state
- draft PR: implementation evidence, validation, rollout notes, and residual risk
- `launchops` project: shared board and cross-repo visibility
- local repo/worktree: execution only

Project URL:

- `launchops`: https://github.com/users/indigo-services/projects/1

## Repo Defaults

The committed workspace config lives in `.ghp/config.json`.

If `ghp config --show -w` reports `Workspace: (not in a git repository)` while `git rev-parse --show-toplevel` succeeds, treat that as a local `ghp` detection bug. In that case, use `.ghp/config.json` as the source of truth and track the CLI mismatch as a separate fix instead of improvising new workflow rules.

Key repo-specific decisions:

- `launchops` is the default project for `ghp plan`, `ghp work`, and `ghp add issue`
- branch naming stays GitHub-user scoped: `{user}/{number}-{title}`
- worktrees are created under `../.worktrees`
- worktree setup uses `yarn && yarn setup`
- worktrees copy local env/link artifacts needed for development and preview checks:
  - `.env`
  - `.env.local`
  - `.vercel/project.json`
  - `next/.env`
  - `next/.env.local`
  - `strapi/.env`
- automatic terminal agent launch is disabled so Windows, VS Code, Codex, and other providers can choose their own execution surface

## Repo Boundaries

Use this repo for studio, CMS, deployment tooling, and workbench execution.

- `indigo-services/indigo-studio`: Strapi, EasyPanel contract, shared tooling, and local execution
- `indigo-services/website-call-indigo`: launch-facing frontend repo for Vercel production deployment
- `studio.call-indigo.com` is owned by `indigo-studio` via EasyPanel
- `call-indigo.com` is owned by `website-call-indigo` via Vercel
- keep cross-repo planning in `launchops`; keep implementation PRs inside the repo that owns the deployed app

## Non-GHP Ingest Rule

Before opening or expanding a material PR, ingest the maintained repo surfaces that already constrain the answer:

- `README.md`
- `docs/architecture.md`
- `docs/release-gates.md`
- `docs/bootstrap-and-deploy.md`
- `docs/deployment/DEPLOYMENT_CHECKLIST.md`
- the active spec or backlog packet in `docs/`

If a proposal does not cite the non-`ghp` surfaces it reused, it is not ready for implementation.

## Daily Commands

```bash
yarn ghp:config:show
yarn ghp:fields
yarn ghp:plan
yarn ghp:plan studio
yarn ghp:plan studio-open
yarn ghp:plan launch-apps
yarn ghp:plan launch-apps-open
yarn ghp:work
yarn ghp:status
yarn ghp:pr
```

## Start Work

1. Create or refine the GitHub issue first.
2. Make sure the issue is on `launchops`.
3. Start from a clean branch or parallel worktree.

Standard branch flow:

```bash
yarn ghp:start 123
```

Parallel worktree flow:

```bash
yarn ghp:start 123 --parallel --keep-branch
```

Because `openTerminal` is disabled in workspace config, `--parallel` creates the worktree without forcing a new terminal window. Open the resulting worktree in your preferred tool.

## PR Discipline

1. One issue per bounded task.
2. One branch or one worktree per issue.
3. Open a draft PR early.
4. Validate locally before requesting review.
5. Merge only after PR checks and issue acceptance criteria pass.

Use these prefixes in issue comments and PR notes so parallel sessions can hand off quickly:

- `Decision:`
- `Approval:`
- `Blocker:`
- `Recommendation:`
- `FOLLOW-UP:`

## Release Notes

- use milestones for release slices, not long-range wish lists
- keep release notes tied to linked issues and merged PRs
- tag only after production deploy is verified for the owning repo
- if both repos participate in one release, record one rollback note per repo
