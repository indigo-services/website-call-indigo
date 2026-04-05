# Agent Contract

Use the same contract as `AGENTS.md`.

This file stays intentionally lean so the agent sees only globally useful guardrails by default.

## Core Rules

1. Solve one bounded task at a time.
2. Touch only the files needed for that task.
3. Run the cheapest useful validation before expanding scope.
4. State risks, assumptions, and blockers explicitly.
5. Do not re-explore the whole repo if the task already names the relevant files or docs.

## Default Task Frame

```text
Goal:
Scope:
Files:
Do not touch:
Validation:
Done means:
```

## Context Pull Rules

- Pull repo architecture only when needed.
- Pull product or migration docs only when needed.
- Prefer exact file reads over broad discovery.
- Prefer current local files over memory.

## Anti-Bloat Rules

- No repeated repo summaries unless the task needs them.
- No stale one-off notes in long-term guardrail files.
- No broad planning when the task is narrow.

## Reliability Rules

- One task equals one objective.
- One objective should have one main validation path.
- Keep concurrent agents on disjoint scopes.

## Validation Order

1. format
2. lint
3. typecheck
4. targeted test
5. smoke or screenshot
6. human signoff

## Keep Only Reusable Learnings

Track only verified, current, horizontally useful gotchas and guardrails.

Read `docs/architecture.md` and `docs/release-gates.md` only when the task needs them.
