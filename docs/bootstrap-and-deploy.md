# Bootstrap And Deploy

## Local Development

Local development is the primary workflow.

- no local Docker requirement
- Strapi uses SQLite locally
- Next and Strapi both run through native Node/Yarn

Start from a fresh clone with:

```bash
yarn
yarn setup
yarn dev
```

`yarn setup`:

- completes the guided repo bootstrap after the initial install
- creates `next/.env` and `strapi/.env` from examples if missing
- prompts for missing local URLs when useful
- generates Strapi secrets automatically
- runs `yarn doctor`

## Doctor

Run the preflight checker at any time:

```bash
yarn doctor
```

It verifies:

- Node and Yarn
- GitHub origin remote
- `next/.env` and `strapi/.env`
- `gh` auth
- `ghp` availability
- Vercel CLI and auth
- Vercel project link at `.vercel/project.json` or `next/.vercel/project.json`
- GitHub secret presence for deploy contracts

Use strict mode only when you want every warning treated as blocking:

```bash
yarn doctor:strict
```

## Required Local Env Files

### `next/.env`

- `WEBSITE_URL`
- `ENVIRONMENT`
- `PORT`
- `NEXT_PUBLIC_API_URL`
- `PREVIEW_SECRET`

### `strapi/.env`

- `HOST`
- `PORT`
- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `CLIENT_URL`
- `PREVIEW_SECRET`
- `DATABASE_CLIENT=sqlite`
- `DATABASE_FILENAME=.tmp/data.db`

## GitHub Secrets

These secrets support the deployment contract:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `EASYPANEL_STRAPI_DEPLOY_WEBHOOK`

The EasyPanel webhook secret is optional until the Strapi production service exists.

## Frontend To Vercel

`call-indigo.com` is owned by the separate frontend repo:

- repo: `indigo-services/website-call-indigo`
- platform: Vercel
- domain: `https://call-indigo.com`

This repo's `next/` app is a local/workbench surface unless it is intentionally linked for preview or manual validation. Do not assume a merge in `indigo-studio` will update the public website.

Expected local checks:

- `vercel --version` or `npx vercel --version`
- `vercel whoami`
- Vercel project linked at repo root or under `next/` only when using this repo for preview/manual deploys

Expected GitHub secrets for repo-owned Vercel automation:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Strapi To EasyPanel

`studio.call-indigo.com` is owned by this repo through EasyPanel.

Recommended production contract:

- source repo: `indigo-services/indigo-studio`
- source mode: Git-backed, not inline YAML
- branch: `main`
- service type: EasyPanel compose app
- compose root path: `/`
- compose file: `docker-compose.yml`
- public domain: `https://studio.call-indigo.com`
- persistent storage:
  - `.tmp`
  - `public/uploads`

Recommended runtime envs:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
CLIENT_URL=https://call-indigo.com
URL=https://studio.call-indigo.com
PUBLIC_URL=https://studio.call-indigo.com
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

Keep Strapi secrets in EasyPanel service env, not in committed files.

## Automation Contract

- PRs validate setup and Strapi build
- this repo should not auto-own production deployment for `call-indigo.com`
- this repo can trigger Strapi deployment to EasyPanel when the deploy webhook exists
- website production deploys should happen in `website-call-indigo`, not through hidden coupling here
