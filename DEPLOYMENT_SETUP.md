# Deployment & CI/CD Setup Guide

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Clone and setup
git clone [your-repo]
cd app-indigo-studio
yarn setup

# Start development
yarn dev
```

### 2. Access Services

- **Next.js App**: http://localhost:3000
- **Strapi Admin**: http://localhost:1337/admin
- **Deployment Dashboard**: http://localhost:3000/dashboard
- **API Health**: http://localhost:3000/api/health

## 📊 Dashboard

The **Deployment Dashboard** is your central hub for deployment readiness.

### Access

```bash
# Via browser
http://localhost:3000/dashboard

# Or open VSCode file explorer
Navigate to: next/src/app/dashboard/page.tsx
```

### Features

✅ **Service Status**
- Real-time health checks for Strapi, Next.js, Admin
- Response time monitoring
- Service availability indicators

✅ **Production Readiness Checklist**
- 20+ critical and non-critical items
- Categorized by area (Environment, Security, Performance, etc.)
- Interactive checkboxes with localStorage persistence
- Critical items required before deployment

✅ **Status Indicators**
- 🟢 Green: All systems operational
- 🔴 Red: Service down or critical issue
- 🟡 Yellow: Warnings detected

## 🔍 Pre-Deployment Validation

### Run All Checks

```bash
# Comprehensive production validation (1-2 minutes)
yarn validate:prod

# What it checks:
# - Environment variables
# - File existence (vercel.json, package.json)
# - Node.js and Yarn versions
# - Build success (both Next.js & Strapi)
# - Security (no hardcoded secrets, npm audit)
# - Formatting and linting
```

### Health Checks

```bash
# Check all service health
yarn health:check

# Checks:
# - Strapi API
# - Next.js App
# - Strapi Admin Panel
# - Response times
```

### CI/CD Status

```bash
# View current CI/CD configuration
yarn ci:status

# Shows:
# - GitHub Actions setup
# - Deployment configurations
# - Environment files
```

## 🌐 Vercel Deployment

### Configuration

All Vercel config is in `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "cd next && yarn build",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "next/app/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 60
    }
  }
}
```

### Environment Variables (Set in Vercel Console)

**Production:**
```
NEXT_PUBLIC_API_URL = https://api.your-domain.com
WEBSITE_URL = https://your-domain.com
ENVIRONMENT = production
JWT_SECRET = [your-secret]
NEXTAUTH_SECRET = [your-secret]
```

**Preview/Staging:**
```
NEXT_PUBLIC_API_URL = https://api-staging.your-domain.com
WEBSITE_URL = https://staging.your-domain.com
```

### Deploy to Preview

```bash
# Deploy pull request to preview URL
yarn deploy:preview

# Automatic on pull requests via GitHub Actions
```

### Deploy to Production

```bash
# Step 1: Run validation
yarn validate:prod

# Step 2: Deploy (will fail validation errors)
yarn deploy:prod

# Automatic on push to main via GitHub Actions
```

## 🔄 GitHub Actions CI/CD

### Workflow File
See: `.github/workflows/deploy.yml`

### On Pull Request
1. Validate code (lint, format)
2. Build Next.js & Strapi
3. Deploy preview to Vercel
4. Add preview URL to PR

### On Push to Main
1. Run full validation suite
2. Build projects
3. Deploy to production
4. Send Slack notification (if configured)

### Required Secrets

Set in GitHub repo settings → Secrets and variables:

```
VERCEL_TOKEN          # From Vercel dashboard
VERCEL_ORG_ID         # Your org ID
VERCEL_PROJECT_ID     # Your project ID
SLACK_WEBHOOK_URL     # Optional: for notifications
```

## 📋 Deployment Checklist

Before deploying, verify:

**Environment & Build**
- [ ] Environment variables defined
- [ ] Local build succeeds
- [ ] No build warnings
- [ ] Dependencies resolved

**Code Quality**
- [ ] Linting passes: `yarn lint`
- [ ] Formatting correct: `yarn fix:format`
- [ ] No TypeScript errors

**Performance**
- [ ] Bundle size acceptable
- [ ] Core Web Vitals targets met
- [ ] Images optimized

**Security**
- [ ] No hardcoded secrets
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] JWT secrets rotated

**Services**
- [ ] Strapi builds successfully
- [ ] Database migrations completed
- [ ] API permissions configured

**Vercel**
- [ ] vercel.json configured
- [ ] Environment variables in Vercel
- [ ] Domains configured

See full checklist: `DEPLOYMENT_CHECKLIST.md`

## 🛠️ VS Code Commands

Press `Ctrl+Shift+P` to open command palette, then:

| Command | Task |
|---------|------|
| `Tasks: Run Task` | View all available tasks |
| Select `dev: Full Stack Development` | Start local dev |
| Select `validate: Production Deployment Validation` | Run pre-deploy checks |
| Select `health: Service Health Check` | Check service status |
| Select `deploy: Production` | Deploy to production |

## 📈 Monitoring & Observability

### All-Green Dashboard

The dashboard shows when everything is ready:
- All services responding
- All critical checklist items complete
- No errors in logs

### Post-Deployment

1. **Check Vercel Dashboard**
   - https://vercel.com/dashboard
   - View logs and analytics

2. **Monitor Performance**
   - Core Web Vitals
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)

3. **Check API Health**
   - `GET https://your-domain.com/api/health`
   - Should return 200 with {"status":"healthy"}

### Uptime Monitoring

The API has a health endpoint used for:
- Vercel uptime monitors
- Third-party monitoring services
- Automated health checks

## 🚨 Troubleshooting

### Build Fails

```bash
# Test locally
cd next && yarn build
cd strapi && yarn build

# Check environment variables
echo $NEXT_PUBLIC_API_URL
echo $WEBSITE_URL

# View Vercel logs
vercel logs --prod
```

### Services Won't Start

```bash
# Check environment setup
yarn setup

# Verify Node version (should be 18+)
node --version

# Clear dependencies
rm -rf node_modules next/node_modules strapi/node_modules
yarn install
```

### Deployment Stuck

```bash
# Check GitHub Actions
# https://github.com/YOUR_ORG/YOUR_REPO/actions

# View real-time logs
vercel logs --follow --prod
```

## 📚 Documentation Files

- **Setup**: `README.md`
- **Deployment**: `VERCEL_DEPLOYMENT.md` (this file)
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Validation**: Run `yarn validate:prod`

## 🎯 Next Steps

1. **Set Environment Variables**
   - Copy `.env.production.example` → `.env.production`
   - Update with your values

2. **Configure GitHub Secrets**
   - Add Vercel tokens
   - Add Slack webhook (optional)

3. **Test Locally**
   - `yarn dev` → verify working
   - `yarn validate:prod` → verify ready

4. **Deploy Preview**
   - Create PR → triggers preview deploy
   - Test preview URL

5. **Deploy Production**
   - Merge to main → triggers production deploy
   - Monitor Vercel dashboard

---

**Dashboard**: http://localhost:3000/dashboard
**Validation**: `yarn validate:prod`
**Deploy Preview**: `yarn deploy:preview`
**Deploy Prod**: `yarn deploy:prod`

🚀 **Ready to deploy!**
