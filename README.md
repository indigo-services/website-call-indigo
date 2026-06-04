# Call Indigo — Next.js Frontend

The public-facing website for [call-indigo.com](https://call-indigo.com), built with Next.js 16, Tailwind CSS, and Framer Motion.

## Architecture

This app lives inside the `app-indigo-studio` monorepo at `next/`. It renders variable content from a local TypeScript module and will later connect to Strapi CMS.

**Content flow:** `next/content/indigo-website.ts` → React components → rendered pages

**Deployment:** Production deploys from the separate [website-call-indigo](https://github.com/indigo-services/website-call-indigo) repo to Vercel. This `next/` directory is the source of truth for development.

## Pages

| Route | Status | Description |
|---|---|---|
| `/` | Live | Home page — hero, pathways, services, process, trust, contact |
| `/commercial` | Planned | Indigo Facilities commercial page |
| `/residential` | Deferred | Indigo Homes residential page |

## Content Model

All visible copy is driven from `content/indigo-website.ts`. JSX renders data, not hardcoded strings.

```ts
site        — brand, phone, email, address
navigation  — nav links
home        — hero, pathways, services, process, trust, finalCta
```

Images use named content keys pointing to `/images/` — no scattered external URLs.

## Commands

```bash
# Development (from monorepo root)
yarn next

# Validation
yarn --cwd next lint
yarn --cwd next build
```

## Environment

Copy `next/.env.example` to `next/.env.local` and configure:

- `NEXT_PUBLIC_API_URL` — Strapi API base URL (for CMS content)
- `IMAGE_HOSTNAME` — image hostname for Next.js image optimization

## Key Files

| File | Purpose |
|---|---|
| `content/indigo-website.ts` | Variable content module (all page copy + image refs) |
| `components/approval-home/landing-page.tsx` | Home page layout |
| `app/page.tsx` | Home page entry point |
| `public/images/` | Local image assets |

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- Tailwind CSS v4
- Framer Motion
- Lucide React icons
- TypeScript
