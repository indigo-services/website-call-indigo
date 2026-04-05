# Agent Contract

This file is intentionally small.

Its job is not to restate the repo. Its job is to keep horizontally useful guardrails front and center, reduce repetition, and improve one-shot success.

## Core Rules

1. Solve one bounded task at a time.
2. Touch only the files needed for that task.
3. Run the cheapest useful validation before expanding scope.
4. State risks, assumptions, and blockers explicitly.
5. Do not re-explore the whole repo if the task already names the relevant files or docs.

## Default Task Frame

Use this shape for every task:

```text
Goal:
Scope:
Files:
Do not touch:
Validation:
Done means:
```

If any field is missing, infer the minimum safe version instead of broadening the task.

## Context Pull Rules

- Pull repo architecture only when the task needs architecture.
- Pull product docs only when the task needs product docs.
- Pull migration docs only when the task touches that migration.
- Prefer exact file reads over broad searches.
- Prefer current local files over stale memory.

## Anti-Bloat Rules

- Do not keep repeating repo summaries in every run.
- Do not front-load implementation details that are irrelevant to the current task.
- Do not carry forward stale assumptions after reading the source files.
- Do not expand a simple task into planning, implementation, validation, and release unless asked.

## Reliability Rules

- One task equals one objective.
- One objective should have one main validation path.
- One change should have one clear proof of success.
- If uncertainty is high, narrow scope before coding.

## Worktree And Branch Rules

- Prefer one branch or one worktree per issue or feature slice.
- Keep concurrent agents on disjoint scopes.
- Do not mix review, implementation, and release work in one broad branch unless the change is tiny.

## Validation Order

1. format
2. lint
3. typecheck
4. targeted test
5. smoke or screenshot
6. human signoff

## Learnings And Gotchas

Track only information that is:

- verified
- current
- broadly reusable
- likely to prevent repeated mistakes

Good examples:

- recurring environment gotchas
- fragile commands
- known flaky paths
- required validation order
- stable file ownership boundaries

Bad examples:

- one-off task notes
- temporary brainstorming
- stale architecture summaries
- long file inventories with no active use

## Escalation Rule

If the task is not succeeding in one shot:

1. identify the exact failure
2. reduce scope
3. gather only the missing context
4. retry with a narrower plan

## Reference Docs

Read these only when needed:

- `docs/architecture.md`
- `docs/release-gates.md`
- task-specific docs under `docs/`
