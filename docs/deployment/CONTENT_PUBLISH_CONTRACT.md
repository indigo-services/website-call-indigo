# Content Publish Contract

## Rule

Code deployment and content publishing are separate operations.

## What Does Not Happen Automatically

- local Strapi SQLite changes do not publish to production by git push
- local uploads do not appear in production by git push
- merging `indigo-studio` does not migrate content into production data stores

## Production Content Sources

Production content should come from one of these paths:

1. content created directly in the production Strapi instance
2. a deliberate export/import migration
3. a documented one-off manual migration for a release

## Release Requirement

If a release depends on content changes, the PR or release notes must state:

- whether the content already exists in production
- whether a migration is required
- whether uploads must be moved
- who owns the publish step

## Domains

- production Strapi: `https://studio.call-indigo.com`
- production website: `https://call-indigo.com`
