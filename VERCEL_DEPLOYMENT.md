# Vercel Deployment Guide

## Quick Start

### 1. Environment Setup

```bash
# Set up development environment
yarn setup

# Configure production environment
cp .env.production.example .env.production
# Edit .env.production with your production values
```

### 2. Vercel Configuration

Vercel configuration is stored in `vercel.json`. Key settings:

- **Framework**: Next.js
- **Build Command**: `cd next && yarn build`
- **Output Directory**: `next/.next`
- **Regions**: iad1 (US), sfo1 (US)
- **Functions**: Node.js 18.x with 60s timeout

### 3. Environment Variables

Set these in Vercel Console for each environment:

**Production:**
- `NEXT_PUBLIC_API_URL`: https://api.your-domain.com
- `WEBSITE_URL`: https://your-domain.com
- `ENVIRONMENT`: production
- `JWT_SECRET`: [Your JWT secret]
- `NEXTAUTH_SECRET`: [Your auth secret]

**Preview/Staging:**
- `NEXT_PUBLIC_API_URL`: https://api-staging.your-domain.com
- `WEBSITE_URL`: https://staging.your-domain.com

## Pre-Deployment Checks

### Run Validation Script

```bash
# Full production validation
yarn validate:prod

# Check service health
yarn health:check

# View CI/CD status
yarn ci:status
```

### Using Dashboard

```bash
# Launch local dashboard
cd next && yarn dev

# Navigate to /dashboard
# http://localhost:3000/dashboard
```

The dashboard provides:
- ✅ Real-time service status (Strapi, Next.js, Admin)
- ✅ Interactive production readiness checklist
- ✅ Category-based verification (Environment, Security, Performance, etc.)
- ✅ Critical vs. non-critical items tracking
- ✅ LocalStorage persistence

## Deployment Workflow

### Preview Deployment (for Pull Requests)

```bash
# Triggered automatically on pull requests to main
# OR manually deploy preview
yarn deploy:preview

# Vercel will provide preview URL in PR comments
```

### Production Deployment

```bash
# 1. Run full validation
yarn validate:prod

# 2. Deploy to production
yarn deploy:prod

# OR single command (validates first)
# The script will prevent deployment if validation fails
```

### GitHub Actions CI/CD

The `.github/workflows/deploy.yml` workflow:

1. **On Pull Request**: 
   - Validates code (lint, format)
   - Builds both Next.js and Strapi
   - Deploys preview to Vercel

2. **On Push to Main**:
   - Runs full validation suite (`yarn validate:prod`)
   - Builds and tests
   - Deploys to production Vercel

3. **Notifications**:
   - Slack integration (requires `SLACK_WEBHOOK_URL` secret)
   - GitHub Actions timeline
   - Deployment logs in Vercel dashboard

## Required Secrets for GitHub Actions

Set these in GitHub repository settings:

```
VERCEL_TOKEN           # From Vercel account
VERCEL_ORG_ID          # Your Vercel org ID
VERCEL_PROJECT_ID      # Your Vercel project ID
SLACK_WEBHOOK_URL      # Optional: for Slack notifications
```

## API Endpoints

### Health Check

```bash
GET /api/health
```

Response when healthy:
```json
{
  "status": "healthy",
  "message": "All systems operational",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "nextjs": "ok",
    "strapi": "ok"
  }
}
```

Used by:
- Deployment monitors
- Uptime checks
- CI/CD pipelines

## Deployment Checklist

A comprehensive checklist is available at `DEPLOYMENT_CHECKLIST.md` covering:

- **Environment & Build**: Variables, builds, no warnings
- **Code Quality**: Linting, formatting, TypeScript
- **Performance**: Bundle size, Core Web Vitals, images
- **Security**: No hardcoded secrets, headers, HTTPS
- **Strapi**: Build, migrations, API permissions
- **Vercel**: Configuration, environment setup
- **Post-Deploy**: Testing, benchmarking, monitoring
- **Maintenance**: 24-hour, weekly, monthly checks

## Monitoring & Analytics

### Post-Deployment

Track these metrics:
- Core Web Vitals (dashboard)
- Error logs (Sentry, if configured)
- API response times
- Database query performance

### Continuous Monitoring

```bash
# View deployment history
vercel list

# Check latest deployment
vercel inspect

# Analytics in Vercel Dashboard
# Speed Insights
# Web Analytics
```

## Rollback

Quick rollback to previous deployment:

```bash
# List recent deployments
vercel list

# Rollback to specific URL
vercel rollback <DEPLOYMENT_URL>
```

## Security

- Environment variables never committed
- `.env.production` in `.gitignore`
- Security headers configured in `vercel.json`
- JWT secrets rotated regularly
- API keys scoped per environment

## Troubleshooting

### Build Fails

```bash
# Test build locally
cd next && yarn build

# Check environment variables
echo $NEXT_PUBLIC_API_URL

# Review Vercel logs
# https://vercel.com/dashboard/project/logs
```

### Slow Deployments

- Check bundle size: `cd next && yarn build -s`
- Verify dependencies not bloating: `yarn why <package>`
- Use Edge Runtime for functions when possible

### Failed Health Checks

- Verify Strapi is running
- Check API URL in environment variables
- Ensure CORS headers allow requests

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `yarn setup` | Setup all environments |
| `yarn dev` | Run dev (both Strapi & Next.js) |
| `yarn build` | Build both projects |
| `yarn validate:prod` | Full production validation |
| `yarn health:check` | Check service health |
| `yarn ci:status` | View CI/CD status |
| `yarn deploy:prod` | Validate & deploy to production |
| `yarn deploy:preview` | Deploy preview |

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Strapi Docs**: https://strapi.io/documentation
- **Deployment Checklist**: See `DEPLOYMENT_CHECKLIST.md`

---

**Last Updated**: April 2026
**Status**: Production Ready ✅
