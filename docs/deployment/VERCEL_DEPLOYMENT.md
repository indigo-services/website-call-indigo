# Vercel Deployment Guide

## Production Ownership

Production website deployment for `https://call-indigo.com` belongs to:

- repo: `indigo-services/website-call-indigo`
- platform: Vercel
- domain: `https://call-indigo.com`

This repo may still use Vercel for preview or manual validation, but it should not be treated as the canonical production source for the public website unless ownership is intentionally changed.

## Environment Variables

When working with the production website repo, the primary Vercel variables are:

**Production**

- `NEXT_PUBLIC_API_URL=https://studio.call-indigo.com/api`
- `WEBSITE_URL=https://call-indigo.com`
- `ENVIRONMENT=production`

**Preview**

- `NEXT_PUBLIC_API_URL=https://studio.call-indigo.com/api`
- `WEBSITE_URL` should match the preview URL or preview domain

## Validation

Before calling the website ready:

- validate the owning frontend repo branch and PR
- review the Vercel build logs
- verify `https://call-indigo.com`
- verify any website health endpoint
- confirm the Strapi origin is `https://studio.call-indigo.com`

## Repo Boundary Rule

If a website change originates in `indigo-studio`, move it into a tracked issue and land the production website implementation in `website-call-indigo`.

Do not rely on hidden deploy coupling between the two repos.
