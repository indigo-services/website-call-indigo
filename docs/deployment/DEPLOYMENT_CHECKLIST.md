# Production Deployment Checklist

## Indigo Studio Topology

- [ ] Easypanel project is `riostack`
- [ ] Easypanel compose service is `indigo-studio`
- [ ] Internal compose service remains `indigo-strapi`
- [ ] Easypanel source mode is Git, not inline
- [ ] Git repo is `git@github.com:indigo-services/indigo-studio.git`
- [ ] Git ref is `main`
- [ ] Compose root path is `/`
- [ ] Compose file is `docker-compose.yml`
- [ ] Strapi public URL is `https://studio.call-indigo.com`
- [ ] Website public URL is `https://call-indigo.com`
- [ ] Website production repo is `indigo-services/website-call-indigo`
- [ ] `indigo-studio` is not treated as the canonical Vercel production source for `call-indigo.com`

## Pre-Deployment Verification (Local)

### Environment & Build

- [ ] All environment variables defined in the correct local env files
- [ ] Dependencies resolve cleanly: `yarn install`
- [ ] Strapi build passes: `yarn build --prefix strapi`
- [ ] `docker-compose.yml` exists at repo root
- [ ] `services.indigo-strapi.build.context` resolves to repo root for the current compose contract
- [ ] `services.indigo-strapi.build.dockerfile` resolves to `strapi/Dockerfile`
- [ ] Do not treat local SQLite content as a production publish source

### Code Quality

- [ ] Linting/typecheck or equivalent targeted validation passes for the changed surface
- [ ] Formatting is clean
- [ ] No hardcoded secrets or credentials
- [ ] Release risk and follow-up are stated in the PR

### Security

- [ ] HTTPS enabled and SSL valid on both production domains
- [ ] JWT and API secrets are scoped to the owning platform
- [ ] No exposed sensitive data in commits
- [ ] Environment variables are split correctly between EasyPanel and Vercel

### Strapi Configuration

- [ ] Admin path is `/manage/admin`
- [ ] `CLIENT_URL` points to `https://call-indigo.com`
- [ ] `URL` and `PUBLIC_URL` point to `https://studio.call-indigo.com`
- [ ] Upload persistence is configured
- [ ] Content types and permissions are validated

## Vercel Deployment

### Ownership

- [ ] Production website changes live in `indigo-services/website-call-indigo`
- [ ] Vercel project is linked to the intended frontend repo and branch
- [ ] `indigo-studio` does not have an accidental auto-deploy path to the public website

### Deployment

- [ ] Feature branch merged in the frontend repo
- [ ] Vercel build logs reviewed
- [ ] `https://call-indigo.com` responds successfully
- [ ] Website health check endpoint responds successfully

## EasyPanel Deployment

### Source Of Truth

- [ ] `yarn easypanel:doctor` passes config and API auth checks
- [ ] Easypanel compose source is Git-backed, not inline YAML
- [ ] GitHub deploy key is attached to `indigo-services/indigo-studio`
- [ ] `deploy:ep` preflight confirms the resolved build context and Dockerfile paths

### Deployment

- [ ] Run `yarn deploy:ep`
- [ ] Confirm bootstrap keeps `indigo-strapi` as the internal compose service
- [ ] Confirm deployment logs show the latest commit from `origin/main`
- [ ] Confirm the deploy reaches container start, not just source sync

### Post-Deploy

- [ ] `yarn easypanel:status` shows the expected compose service
- [ ] `yarn easypanel:health` reports the Strapi public URL and admin path
- [ ] `https://studio.call-indigo.com` returns successfully
- [ ] `https://studio.call-indigo.com/manage/admin` responds successfully

## Content Publish Contract

- [ ] Local SQLite changes are not assumed to deploy automatically
- [ ] Production content is created directly in production or migrated intentionally
- [ ] Export/import or manual migration steps are recorded when content changes are part of the release
- [ ] File uploads are migrated deliberately when required

## Release Qualification

- [ ] Linked issue or tracked release task exists
- [ ] Narrow PR scope is preserved
- [ ] Validation command output is recorded
- [ ] Production ownership boundaries are called out in release notes
- [ ] Version bump occurs only in repos that changed
- [ ] Git tags are created after verified production deploy
- [ ] Rollback note exists for each repo involved

## Deployment History

| Date | Version | Repos | Domains | Status |
|------|---------|-------|---------|--------|
| | | | | |

## Notes

- Keep this checklist aligned with the real owning repos and domains.
- Do not call a release complete until both domains are verified on their owning platforms.
