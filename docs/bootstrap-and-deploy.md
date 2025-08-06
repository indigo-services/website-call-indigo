# Bootstrap And Deploy

## Local Development

Local development is the primary workflow.

- no local Docker requirement
- Strapi uses SQLite locally
- Next and Strapi both run through native Node/Yarn

Start from a fresh clone with:

```bash
yarn setup
yarn dev
```

`yarn setup` now:

- installs dependencies
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

The EasyPanel webhook secret is optional until the Strapi staging service exists.

## Next To Vercel

The Vercel deployment lane is driven by GitHub Actions and the Vercel CLI.

Expected local checks:

- `vercel --version` or `npx vercel --version`
- `vercel whoami`
- Vercel project linked at repo root or under `next/`

Expected GitHub secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Strapi To EasyPanel

Strapi staging is intended for EasyPanel App Service using GitHub source.

Recommended service contract:

- source repo: `indigo-services/indigo-studio`
- branch: `main`
- build path: `strapi`
- database: SQLite for staging
- persistent storage:
  - `.tmp`
  - `public/uploads`

Recommended runtime envs:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
CLIENT_URL=https://your-next-site.example.com
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

Keep Strapi secrets in EasyPanel service env, not in committed files.

## Automation Contract

- PRs validate setup and Strapi build
- `main` can deploy Next to Vercel when Vercel secrets exist
- `main` can trigger Strapi staging deployment through the EasyPanel deploy webhook when that secret exists
