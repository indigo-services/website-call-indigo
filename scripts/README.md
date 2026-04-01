# Deployment Scripts Documentation

This directory contains automated scripts for production deployment validation, health monitoring, and CI/CD status tracking.

## Scripts Overview

### 1. `validate-prod.mts` - Production Deployment Validation

**Purpose**: Comprehensive pre-deployment validation script  
**Run**: `yarn validate:prod`  
**Time**: 2-5 minutes

#### Checks Performed:

**Environment Variables**
- Validates required variables are set
- Checks production-specific secrets for production environment
- Output shows which variables are missing or properly configured

**File Existence**
- vercel.json ✓ (critical)
- package.json files ✓ (critical)
- DEPLOYMENT_CHECKLIST.md (optional)

**Dependencies**
- Yarn is installed
- Node.js version 18+
- Packages properly installed

**Build Validation**
- Next.js builds successfully
- Strapi builds successfully
- No TypeScript compilation errors
- Build completes within timeout

**Code Quality**
- ESLint passes (or reports warnings)
- Code formatting checked

**Security**
- Scans for hardcoded secrets/credentials
- Runs npm audit for vulnerabilities
- Checks environment files aren't exposed

#### Output:
```
╔═══════════════════════════════════════════════════════════╗
║   Production Deployment Validation Script                ║
║   Strapi + Next.js on Vercel                             ║
╚═══════════════════════════════════════════════════════════╝

--- Environment Variables ---
✓ NEXT_PUBLIC_API_URL defined
✓ WEBSITE_URL defined
✓ ENVIRONMENT: production
✗ JWT_SECRET not defined (required for Production)

--- Detailed Results ---
✓ Yarn: Yarn is available
✓ Node.js Version: Node.js v18.16.0

═══════════════════════════════════════════════════════════

✗ 1 critical issue(s) must be resolved before deployment
```

#### Exit Codes:
- `0`: All checks passed, ready to deploy
- `1`: Critical issues found, deployment blocked

---

### 2. `health-check.mts` - Service Health Monitoring

**Purpose**: Real-time health status of all services  
**Run**: `yarn health:check`  
**Time**: < 10 seconds

#### Checks Services:
- Strapi API (`/health` endpoint)
- Next.js Application
- Strapi Admin Interface

#### Output:
```
╔══════════════════════════════════════════════════════════╗
║   Health Check - Strapi + Next.js                        ║
╚══════════════════════════════════════════════════════════╝

Checking services...

✓ Strapi API            OK - 125ms
✓ Next.js App           OK - 89ms
✓ Strapi Admin          OK - 156ms

────────────────────────────────────────────────────────────
✓ All services healthy
```

#### Status Indicators:
- ✓ Healthy (green)
- ✗ Unhealthy (red)
- ⚠ Warning (yellow)

---

### 3. `ci-status.mts` - CI/CD Pipeline Status

**Purpose**: View current CI/CD configuration  
**Run**: `yarn ci:status`  
**Time**: < 5 seconds

#### Checks:
- GitHub Actions configured
- GitLab CI configured
- CircleCI configured
- Jenkins configured
- Vercel configuration
- Docker Dockerfile
- Kubernetes configs
- Environment files

#### Output:
```
╔════════════════════════════════════════════════════════╗
║   CI/CD Pipeline Status Report                         ║
╚════════════════════════════════════════════════════════╝

CI/CD Configuration:
✓ GITHUB: configured
⊙ GITLAB: not-configured
⊙ CIRCLECI: not-configured
⊙ JENKINS: not-configured

Deployment Configuration:
✓ VERCEL: configured
⊙ DOCKER: not-configured
⊙ K8S: not-configured

Environment Configuration:
✓ .env.example: present
✓ .env.production: present
✓ vercel.json: present

────────────────────────────────────────────────────────
For detailed pipeline info:
- GitHub: https://github.com/YOUR_ORG/YOUR_REPO/actions
- Vercel: https://vercel.com
```

---

## Integration Points

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` file automatically runs these checks:

```yaml
# On Pull Request
- Runs: validate:prod, health:check, lint, build

# On Push to Main
- Runs: validate:prod
- Then: Deploys to production
- Then: Sends Slack notification
```

### Vercel Deployment

The validation scripts are called before Vercel deployment:
```bash
yarn validate:prod  # Must pass for deployment
yarn deploy:prod    # Actually deploys only if validation passes
```

### VS Code Integration

Tasks in `.vscode/tasks.json` allow running scripts from command palette:
```
Ctrl+Shift+P → Tasks: Run Task → deploy:validate-production
```

---

## Usage Examples

### Pre-Deployment Workflow
```bash
# 1. Validate everything is ready
yarn validate:prod

# 2. Check services are healthy
yarn health:check

# 3. View CI/CD status
yarn ci:status

# 4. If all green, deploy
yarn deploy:prod
```

### During PR Review
```bash
# Reviewer wants to verify production readiness
yarn validate:prod

# Was built on CI/CD already
# This would verify same checks locally
```

### Monitoring Production
```bash
# Daily health check
yarn health:check

# Would be run by uptime monitoring service
GET https://your-domain.com/api/health
```

### Troubleshooting Failed Deployment
```bash
# What check failed?
yarn validate:prod

# Which services are down?
yarn health:check

# Is CI/CD misconfigured?
yarn ci:status
```

---

## Error Handling

### If Validation Fails

The `validate-prod.mts` script will:
1. Identify which check failed
2. Provide specific error message
3. Suggest remediation
4. Exit with code 1 (prevent deployment)

Example:
```
✗ Next.js build failed
Build error: Cannot find module 'react'

Remediation: Run 'cd next && yarn install'
```

### If Health Check Fails

The `health-check.mts` script will:
1. Show which service is unhealthy
2. Display HTTP status code
3. Display timeout status
4. Suggest which endpoint to debug

Example:
```
✗ Strapi API (HTTP 503)
  The Strapi service is not responding

Suggestion: Check if Strapi process is running
  Control+C to stop and restart
```

### If CI/CD Status Shows Issues

The `ci-status.mts` script will:
1. Show which CI/CD service is used
2. Show deployment config status
3. Suggest next steps

---

## Performance Notes

- `validate-prod`: 2-5 min (build time dependent)
- `health-check`: < 10 seconds
- `ci-status`: < 5 seconds

For large projects, validation can be split:
- Linting in isolation: `yarn lint`
- Build in isolation: `cd next && yarn build`
- Tests in isolation: `yarn test`

---

## Extending Scripts

### Add Custom Validation

Edit `scripts/validate-prod.mts`:

```typescript
function checkCustom(): void {
  log('\n--- Custom Checks ---', blueColor);

  try {
    // Your custom check
    success('Custom check passed');
    results.push({
      name: 'Custom Check',
      passed: true,
      message: 'No issues found',
      critical: true,  // or false
    });
  } catch (err) {
    error('Custom check failed');
    results.push({
      name: 'Custom Check',
      passed: false,
      message: err.message,
      critical: false,  // Warnings won't block deployment
    });
  }
}

// Call in main()
checkCustom();
```

### Add Health Check Endpoint

Edit `scripts/health-check.mts`:

```typescript
// Add to main()
results.push(
  await checkEndpoint('My Service', 'https://my-service.com/health', 5000)
);
```

---

## Troubleshooting Scripts

### Script Won't Run

```bash
# If you get "command not found"
# Make sure ts-node is installed
yarn add --dev ts-node

# Or run directly with Node
node --loader ts-node/esm ./scripts/validate-prod.mts
```

### Outdated Node Types

```bash
# If TypeScript complains about missing types
yarn add --dev @types/node
```

### Encoding Issues on Windows

```bash
# On Windows, set environment variable
set CHCP=65001

# Or in PowerShell
$env:CHCP=65001
```

---

## Maintenance

Review and update scripts when:
- Adding new critical dependencies
- Changing build process
- Adding new services
- Updating Node.js versions
- Changing deployment platforms

---

## See Also

- `DEPLOYMENT_CHECKLIST.md` - Manual pre-deployment tasks
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Full deployment guide
- `vercel.json` - Vercel configuration
- `.github/workflows/deploy.yml` - GitHub Actions workflow
