# GitHub GHP Workflow

## Purpose

This repo uses GitHub as the source of truth for planning and PR delivery.

`ghp` is the local collaboration layer for:

- project board views
- issue creation
- worktree creation
- branch-to-issue linking
- draft PR execution flow
- parent PR coordination for narrow child slices

## Canonical Surfaces

- GitHub issue: scope, acceptance criteria, approvals, blockers
- draft PR: implementation evidence, validation, rollout notes
- parent PR: umbrella narrative, merge order, and child-slice index
- `launchops` project: shared board and status tracking
- local repo/worktree: execution only
- VS Code: daily execution UI, review surface, and task runner
- non-`ghp` repo standards: architecture, release gates, scripts, and active product specs

## Repo Defaults

The committed workspace config lives in `.ghp/config.json`.

Key repo-specific decisions:

- `launchops` is the default project for `ghp plan`, `ghp work`, and `ghp add issue`
- branch naming stays GitHub-user scoped: `{user}/{number}-{title}`
- worktrees are created under `../.worktrees`
- worktree setup uses `yarn setup`
- worktrees copy `.env`, `next/.env`, and `strapi/.env`
- automatic terminal agent launch is disabled so Windows, VS Code, Codex, and other providers can choose their own execution surface
- GitHub branch naming stays deterministic and issue-scoped
- rollout defaults should reuse existing preview or env surfaces before adding new flag tooling

## Non-GHP Ingest Rule

`ghp` is the orchestration layer, not the full context model.

Before opening or expanding a material PR, ingest the maintained repo surfaces that already constrain the answer:

- `README.md` for baseline runtime and repo shape
- `docs/architecture.md` for source-of-truth boundaries
- `docs/release-gates.md` for done criteria
- `docs/agentic-team-playbook-a-z.md` for low-token, deterministic operating rules
- `scripts/README.md` for existing validation and deployment automation
- the active spec, PRD, or migration packet in `docs/` for the affected feature area

If a proposal does not cite the non-`ghp` surfaces it reused, it is not ready for implementation.

## Daily Commands

```bash
yarn ghp:config:show
yarn ghp:fields
yarn ghp:plan
yarn ghp:plan studio
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

## Parent PR Model

Use a parent PR when a capability is too large for one safe merge but should still read as one delivery track.

- parent PR owns the top-level problem statement, rollout notes, and merge order
- child PRs own one bounded write set and one deterministic validation set
- child PRs can target the parent branch when stacked delivery is required
- every child PR must link back to the parent PR and the canonical GitHub issue
- merge the parent only after its child slices are merged or intentionally cut from scope

Default rule: prefer one issue and one PR. Move to a parent-plus-child model only when it reduces review risk.

## Proposal-First PRs

When discovery is still active, open a draft PR as a proposal rather than waiting for a large implementation diff.

- use the PR template to define write set, rollout mode, and validation plan up front
- record which non-`ghp` surfaces were ingested before proposing any net-new system
- compare competing approaches instead of presenting one default answer
- keep proposal PRs documentation-heavy and code-light
- convert proposal sections into implementation evidence as work lands

## Proposal Competition

For material work, require at least two credible approaches before committing build effort.

- option scoring should optimize for low token burn, high success probability, and maximum reuse of maintained surfaces
- default winner is the option that reuses the most existing repo, GitHub, VS Code, and Vercel capability while still satisfying the issue
- only choose net-new platform work when reuse has been clearly exhausted

Useful scoring questions:

- which option depends on the fewest new moving parts
- which option keeps validation cheapest
- which option leaves the clearest artifacts for the next team
- which option creates something genuinely reusable instead of just more process

## Agent Review Standard

Every proposal or implementation PR should survive one adversarial review pass.

- challenge scope expansion
- challenge unnecessary new tooling
- challenge hidden runtime flags or rollout complexity
- challenge anything that does not improve reuse, proof, or recovery
- keep the strongest rejected option in the PR notes so future teams can revisit it without redoing the thinking

## First-Principles Novelty Rule

Build new code, workflow, or platform combinations only when all of the following are true:

- the capability is not already available through maintained repo assets, GitHub, VS Code, Vercel, or existing dependencies
- the combination is useful enough that future teams can build on it
- the new surface has a clear owner, validation path, and rollback story

If those conditions are not met, prefer reuse, documentation, or a narrower proposal over implementation.

## Vercel Gating

This repo should maximize existing rollout surfaces before adding a feature-flag system.

- default review gate for frontend work is a draft PR plus Vercel preview deployment
- if runtime gating is required, reuse an existing env or content switch already present in the repo
- do not introduce a new flag service or flag SDK in a baseline slice unless there is a dedicated issue for that platform choice
- if a new flag system is truly required later, capture it as a separate tracked decision and PR

## VS Code DX

The intended editor loop is VS Code operating directly on the issue-linked worktree.

- use the workspace tasks for `ghp plan`, `ghp work`, `ghp start`, `ghp pr`, preview deploy, and validation
- use the GitHub Pull Requests extension to review the parent PR and child PR threads without leaving the editor
- keep the active parent PR open in the editor while implementing the child slice in its own worktree
- treat the parent PR as the conversation hub; child PRs should stay short and implementation-specific

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
6. If using stacked delivery, the parent PR should explain merge order explicitly.
7. Keep rollout notes deterministic: preview URL, env gate, or no gate.

## Monorepo Notes

- Do not mix `next/`, `strapi/`, and workflow/config changes in one PR unless the issue explicitly requires it.
- Keep feature work off the contaminated legacy branch line.
- Use repo-local `.ghp` settings as the shared baseline and personal user config only for local overrides.
