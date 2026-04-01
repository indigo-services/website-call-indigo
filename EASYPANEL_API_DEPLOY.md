# Easypanel API Deployment - Quick Start

**Status:** ✅ Ready for API-based deployment  
**Method:** GitHub source integration (recommended)  
**Key Rotation:** After deployment verification

---

## 🚀 Quick Start: 3 Steps

### Step 1: Verify Credentials
```bash
# Check if all required tokens are available
echo $GITHUB_TOKEN           # GitHub token (required)
echo $EASYPANEL_API         # Easypanel API token (in .env)
```

### Step 2: Run API Deployment
```bash
yarn deploy:easypanel:api
```

**What happens:**
1. ✅ Validates production readiness
2. ✅ Builds Next.js application
3. ✅ Builds Strapi backend
4. ✅ Loads environment variables
5. ✅ Creates services via API (GitHub source)
6. ✅ Triggers automatic deployment
7. ✅ Displays completion status

### Step 3: Monitor & Verify
```bash
# Monitor in Easypanel dashboard
# https://easypanel.io/dashboard

# Or check health locally (after services start)
yarn health:check
```

---

## 📋 What Gets Deployed

### Next.js Service
- **Source:** GitHub repository (auto-pull from main)
- **Build:** `cd next && yarn install && yarn build`
- **Start:** `cd next && yarn start`
- **Port:** 3000
- **Auto-redeploy:** On every push to main
- **Environment:** All vars from `.env.production`

### Strapi Service
- **Source:** GitHub repository (auto-pull from main)
- **Build:** `cd strapi && yarn install && yarn build`
- **Start:** `cd strapi && yarn start`
- **Port:** 1337
- **Auto-redeploy:** On every push to main
- **Environment:** All vars from `.env.production` + ADMIN_PATH
- **Health Check:** `/health` endpoint (30s interval)

---

## 🔑 Environment Variables Required

### In `.env` (local, for Easypanel API access):
```
EASYPANEL-API=<your-token>        # From Easypanel dashboard
GITHUB_TOKEN=<your-token>         # From GitHub (Personal Access Token)
GITHUB_REPOSITORY=<org/repo>      # e.g., indigo-buildops/indigo-studio
```

### In `.env.production` (for deployed services):
```
NEXT_PUBLIC_API_URL=...           # Strapi API URL
WEBSITE_URL=...                   # Frontend domain
ENVIRONMENT=production
JWT_SECRET=...                    # Generate random, rotate after
NEXTAUTH_SECRET=...               # Generate random, rotate after
```

---

## 🔄 What the Script Does

```
┌─────────────────────────────────────┐
│   yarn deploy:easypanel:api         │
└────────────────┬────────────────────┘
                 │
        ┌────────▼─────────┐
        │  Validate Build  │
        └────────┬─────────┘
                 │
     ┌───────────▼───────────┐
     │  Build Next.js &      │
     │  Build Strapi         │
     └───────────┬───────────┘
                 │
     ┌───────────▼───────────┐
     │  Load Environment     │
     │  Variables from .env  │
     └───────────┬───────────┘
                 │
   ┌─────────────▼──────────────┐
   │  Call Easypanel API v1     │
   │  - Create Next.js Service  │
   │  - Create Strapi Service   │
   │  - Set GitHub as source    │
   │  - Configure auto-redeploy │
   └─────────────┬──────────────┘
                 │
     ┌───────────▼───────────┐
     │  Trigger Deployment   │
     │  Monitor via Dashboard│
     └───────────────────────┘
```

---

## 📊 API Endpoints Used

```
POST /projects/{projectId}/services
  Creates service with GitHub source

POST /projects/{projectId}/services/{serviceId}/deploy
  Triggers immediate deployment

GET /projects/{projectId}/services
  Lists all services (for status checking)
```

---

## ✅ After Deployment

### Verify It's Working
```bash
# 1. Check Easypanel dashboard
# https://easypanel.io/dashboard
# Wait for both services to show "healthy"

# 2. Test endpoints
curl https://your-domain.com/
curl https://your-domain.com/api/health

# 3. Check locally
yarn health:check

# 4. Test admin panel
# https://your-domain.com/admin
```

### Rotate Keys (Important!)
```bash
# After confirming everything works:

# 1. Generate new secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 2. Update in Easypanel dashboard
# Services → Environment Variables → Update secrets

# 3. Restart services in dashboard

# 4. Re-run health check
yarn health:check
```

---

## 🚨 Troubleshooting

### If deployment fails:

**Error: "GitHub token not found"**
```bash
# Add to .env or set environment variable
export GITHUB_TOKEN=your_token
```

**Error: "Easypanel API token not found"**
```bash
# Add to .env file
echo "EASYPANEL-API=your_token" >> .env
```

**Error: "Service creation failed"**
```bash
# Check Easypanel API status
# Verify project ID is correct
# Confirm GitHub token has required permissions
```

**Services won't build:**
```bash
# Run locally first to verify
yarn dev

# Check build logs in Easypanel dashboard
# Services → Logs → Build log
```

### If services are stuck:

```bash
# In Easypanel dashboard:
# 1. Click service
# 2. Click "Stop"
# 3. Wait for "Stopped" status
# 4. Click "Deploy" to restart
```

---

## 🔐 Security Notes

- ✅ GitHub token is used only to pull code
- ✅ Easypanel API token manages infrastructure
- ✅ Environment variables are encrypted in Easypanel
- ⚠️  **Rotate keys after successful deployment**
- ⚠️  **Never commit secrets to git**
- ✅ GitHub auto-redeploy: on every push to main

---

## 📈 Auto-Redeploy Configuration

After initial deployment, services auto-redeploy when:
- Push to main branch on GitHub
- Files in `./next/` or `./strapi/` change
- `package.json` or `yarn.lock` changes

**Disable auto-redeploy:**
In Easypanel dashboard → Service Settings → Auto Deploy → OFF

---

## 🎯 Next Steps

1. **Deploy now:**
   ```bash
   yarn deploy:easypanel:api
   ```

2. **Monitor deployment:**
   - Open Easypanel dashboard
   - Watch build and deployment progress
   - Wait for "healthy" status

3. **Verify works:**
   ```bash
   yarn health:check
   ```

4. **Rotate keys:**
   - Generate new JWT_SECRET and NEXTAUTH_SECRET
   - Update in Easypanel
   - Restart services

5. **Enable CI/CD (optional):**
   ```bash
   # Future: GitHub Actions will auto-deploy on push
   git push origin main
   ```

---

**All set!** Your deployment is automated and ready.
