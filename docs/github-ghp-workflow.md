# GitHub GHP Workflow

## Purpose

This repo uses GitHub as the source of truth for planning and PR delivery.

`ghp` is the local collaboration layer for:

- project board views
- issue creation
- worktree creation
- branch-to-issue linking
- draft PR execution flow

## Canonical Surfaces

- GitHub issue: scope, acceptance criteria, approvals, blockers
- draft PR: implementation evidence, validation, rollout notes
- `launchops` project: shared board and status tracking
- local repo/worktree: execution only

## Repo Defaults

The committed workspace config lives in `.ghp/config.json`.

Key repo-specific decisions:

- `launchops` is the default project for `ghp plan`, `ghp work`, and `ghp add issue`
- branch naming stays GitHub-user scoped: `{user}/{number}-{title}`
- worktrees are created under `../.worktrees`
- worktree setup uses `yarn setup`
- worktrees copy `.env`, `next/.env`, and `strapi/.env`
- automatic terminal agent launch is disabled so Windows, VS Code, Codex, and other providers can choose their own execution surface

## Daily Commands

```bash
yarn ghp:config:show
yarn ghp:fields
yarn ghp:plan
yarn ghp:plan studio
yarn ghp:work
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

## Open Shortcuts

- `yarn ghp:plan studio`
- `yarn ghp:plan studio-open`
- `yarn ghp:plan landing`

These shortcuts keep the `launchops` board readable when multiple repos are sharing the same project.

## PR Discipline

1. One issue per bounded task.
2. One branch or one worktree per issue.
3. Open a draft PR early.
4. Validate locally before requesting review.
5. Merge only after PR checks and issue acceptance criteria pass.

## Monorepo Notes

- Do not mix `next/`, `strapi/`, and workflow/config changes in one PR unless the issue explicitly requires it.
- Keep feature work off the contaminated legacy branch line.
- Use repo-local `.ghp` settings as the shared baseline and personal user config only for local overrides.
