## Proposal Summary

- Issue:
- Parent PR:
- PR mode: direct slice / child slice / proposal only
- Base branch:
- Worktree path:
- Write set:

## Why This Exists

Describe the user or delivery problem this PR solves now.

## Reuse Existing Surfaces

Confirm which existing repo surfaces this PR is using instead of introducing new workflow machinery.

- [ ] GitHub issue is the source of truth
- [ ] `ghp` manages issue, branch, and worktree flow
- [ ] non-`ghp` repo context has been ingested before design decisions
- [ ] PR stays narrow and deterministic
- [ ] Vercel preview is the review surface for web changes
- [ ] Existing env/content switches are reused if rollout gating is needed
- [ ] No new feature-flag system is introduced in this PR

## Non-GHP Context Ingested

Check every maintained surface that informed this proposal or implementation.

- [ ] `README.md`
- [ ] `docs/architecture.md`
- [ ] `docs/release-gates.md`
- [ ] `docs/agentic-team-playbook-a-z.md`
- [ ] `scripts/README.md`
- [ ] relevant product or migration spec in `docs/`
- [ ] existing GitHub PRs, issues, or release notes related to this slice
- [ ] current repo scripts or config that already solve part of the problem

Context notes:

## Parent And Child PR Contract

Fill this in when the PR is part of a larger parent stream.

- Parent outcome:
- Child slice outcome:
- Merge order:
- Follow-up child PRs:

## Delivery Plan

Describe the bounded implementation plan for this slice.

## Competing Proposals

Do not present only one path for material work. Compare at least two serious options and prefer the one that reuses the most maintained surface area.

| Option | What it reuses | Net-new build required | Token cost | Success odds | Why it wins or loses |
|---|---|---|---|---|---|
| A |  |  | low / medium / high | low / medium / high |  |
| B |  |  | low / medium / high | low / medium / high |  |
| C |  |  | low / medium / high | low / medium / high | optional |

Selected option:

## Novelty Test

Only spend energy on net-new work if it passes this bar.

- What has not already been built in this repo, platform, or maintained dependency?
- What combination is novel enough that others could build on it later?
- If this is only recombining existing maintained parts, why is that combination still worth standardizing here?
- If the answer is weak, stop at proposal or docs instead of building more system.

## Rollout And Gating

- Exposure mode: none / draft PR only / Vercel preview only / existing env or content gate
- Gate or env name:
- Removal or merge condition:
- Rollback path:

## Validation

List the exact validation commands and proof collected for this PR.

- [ ] `yarn check:format`
- [ ] affected app lint, build, or smoke check
- [ ] preview or local proof captured when UI changed
- [ ] remaining risk called out explicitly

Validation notes:

## Risks And Follow-up

Call out real residual risk, not generic caution text.

## Agent Review

- Reviewer agent or reviewer pass:
- Scope challenge raised:
- Standards checked:
- Cheapest proof accepted:
- Reasons a broader build was rejected:

## Linked Work

- GitHub issue:
- Parent PR:
- Child PRs or follow-ups:
