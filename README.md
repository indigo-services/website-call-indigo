# Indigo Studio Platform

Forked Indigo MVP baseline built on standard Strapi + Next.js, with deterministic local tooling and a release-oriented URL map.

## Local Surfaces

| Surface | URL | Purpose |
| --- | --- | --- |
| Public Preview | [http://localhost:3000/](http://localhost:3000/) | Indigo residential conversion landing |
| DX Dashboard | [http://localhost:3000/dev](http://localhost:3000/dev) | Local start page for the stack |
| Launch Demo | [http://localhost:3000/home-demo-01](http://localhost:3000/home-demo-01) | Archived LaunchPad demo for comparison |
| CMS Admin | [http://localhost:1000/manage/admin](http://localhost:1000/manage/admin) | Canonical Strapi admin |
| CMS Alias | [http://localhost:1000/build/superadmin](http://localhost:1000/build/superadmin) | Compatibility redirect to canonical admin |
| API | [http://localhost:1000/api](http://localhost:1000/api) | Strapi REST API |
| Storybook | [http://localhost:6006/](http://localhost:6006/) | Visual registry and component review |

## Core Commands

```powershell
# Indigo Studio Platform

Forked Indigo MVP baseline built on standard Strapi + Next.js, with deterministic local tooling and a release-oriented URL map.

## Local Surfaces

| Surface        | URL                                                                              | Purpose                                   |
| -------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| Public Preview | [http://localhost:3000/](http://localhost:3000/)                                 | Indigo residential conversion landing     |
| DX Dashboard   | [http://localhost:3000/dev](http://localhost:3000/dev)                           | Local start page for the stack            |
| Launch Demo    | [http://localhost:3000/home-demo-01](http://localhost:3000/home-demo-01)         | Archived LaunchPad demo for comparison    |
| CMS Admin      | [http://localhost:1000/manage/admin](http://localhost:1000/manage/admin)         | Canonical Strapi admin                    |
| CMS Alias      | [http://localhost:1000/build/superadmin](http://localhost:1000/build/superadmin) | Compatibility redirect to canonical admin |
| API            | [http://localhost:1000/api](http://localhost:1000/api)                           | Strapi REST API                           |
| Storybook      | [http://localhost:6006/](http://localhost:6006/)                                 | Visual registry and component review      |

## Core Commands

```powershell
yarn setup
yarn dev
yarn dev:vscode
yarn codex:doctor
yarn --cwd next dev
yarn --cwd strapi develop
```

## Release Baseline

| Area             | Reference                                                                        |
| ---------------- | -------------------------------------------------------------------------------- |
| Agent rules      | [AGENTS.md](./AGENTS.md)                                                         |
| Claude rules     | [CLAUDE.md](./CLAUDE.md)                                                         |
| Codex status     | [docs/codex-configuration-status.md](./docs/codex-configuration-status.md)       |
| Home migration   | [docs/home-landing-migration/README.md](./docs/home-landing-migration/README.md) |
| Dev dashboard    | [next/app/dev/page.tsx](./next/app/dev/page.tsx)                                 |
| Public preview   | [next/app/page.tsx](./next/app/page.tsx)                                         |
| Launch demo copy | [next/app/home-demo-01/page.tsx](./next/app/home-demo-01/page.tsx)               |

## Operating Notes

- Next uses `http://localhost:3000` for the public preview and DX dashboard.
- Strapi runs on `http://localhost:1000` in development.
- The canonical Strapi admin path is `/manage/admin`.
- `/build/superadmin` redirects to the canonical admin path for compatibility.
- The Storybook harness is not committed in this repo yet, but the UI blocks are being structured to be story-ready.

## What Ships In This Baseline

- Root public preview landing for Indigo release review.
- Archived LaunchPad demo route for comparison and client signoff.
- DX dashboard for local app entry points.
- Strapi configuration aligned to the new port and admin path.
- Repo-level guardrails for Codex, release quality, and team workflows.
