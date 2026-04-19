# Easypanel Strapi Scheduler Contract

## Purpose

Scheduled backend work for this platform belongs on the Strapi / EasyPanel side, not on Vercel.

This keeps the scheduler aligned with the system that owns the CMS state, deployment runtime, and production backend behavior.

## Standard

- Use Strapi built-in cron or a Strapi-owned scheduled job mechanism for recurring backend tasks.
- Run the scheduler on the EasyPanel VPS that hosts Strapi.
- Keep Vercel focused on frontend delivery and normal request handling.
- Use webhooks or explicit admin-triggered actions when a task should run immediately after content changes.

## Non-goals

- Do not add Vercel cron jobs for Strapi maintenance or content workflows.
- Do not duplicate the same scheduled task in both Vercel and Strapi.
- Do not move backend ownership into the frontend repo.

## Operational Flow

1. Strapi performs or exposes the scheduled action.
2. EasyPanel hosts the running Strapi process.
3. The frontend consumes the resulting API state or receives webhook-driven updates.
4. Health checks stay available as normal routes, but they are not scheduler triggers.

## Validation

- Confirm the scheduled job exists in the Strapi / EasyPanel deployment path.
- Confirm `vercel.json` does not define cron entries for backend scheduling.
- Confirm frontend deployments do not depend on Vercel scheduler behavior.

## Reference

- Repository changelog entry for the Vercel cron removal.
