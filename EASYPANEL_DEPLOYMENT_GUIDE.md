# Easypanel Strapi Deployment Guide

## 🚀 Quick Fix for Current Deployment

Your Easypanel deployment needs **manual environment variable configuration**. Follow these steps:

### Option 1: Manual Configuration (Fastest)

1. **Open Easypanel Dashboard**
2. **Navigate to** `indigo-studio` service
3. **Go to** "Environment Variables" tab
4. **Copy and paste** the contents of `.env.easypanel` file
5. **Save** and **Deploy** the service
6. **Wait 2-3 minutes** for the service to restart

### Option 2: Use Docker Compose (Recommended)

If Easypanel supports Docker Compose:

1. **In Easypanel**, switch your service to use "Docker Compose" mode
2. **Point to** the `docker-compose.yml` file in the repository root
3. **Deploy** - this will automatically configure all environment variables

## 📋 Environment Variables

Copy these exactly into Easypanel:

```
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
APP_KEYS=d3800189_ad55_41bf_a330_0e326d6873781,ae374b7b_2d06_4c99_9be0_08d6c0ed34622
API_TOKEN_SALT=63a1c48c_c951_4bfe_831a_f34009a317c3
ADMIN_JWT_SECRET=05130689_2be1_46cc_ad3b_ae1d02798660
TRANSFER_TOKEN_SALT=bbd36f19_e683_47cb_a477_acce1c4531c8
JWT_SECRET=00df0dde_c4b6_412a_a239_c65963c7e02a
ADMIN_AUTH_SECRET=05130689_2be1_46cc_ad3b_ae1d02798660
ADMIN_PATH=/manage/admin
CLIENT_URL=https://riostack-indigo-studio.ck87nu.easypanel.host
PREVIEW_SECRET=300f6f44_f604_4fa0_8e9c_4110412dd41e
URL=https://riostack-indigo-studio.ck87nu.easypanel.host
PUBLIC_URL=https://riostack-indigo-studio.ck87nu.easypanel.host
```

## 🔍 Why This Happened

Easypanel's GitHub integration works great for:
- ✅ Pulling code from GitHub
- ✅ Building Docker images
- ✅ Auto-deploying on push

But it **doesn't automatically**:
- ❌ Load `.env.production` files
- ❌ Set environment variables from files
- ❌ Configure service settings

## 🎯 After Configuration

Once you add the environment variables:

1. **Service will start successfully** - No more JWT secret errors
2. **Health check will pass** - Service becomes healthy
3. **URL will work** - `https://riostack-indigo-studio.ck87nu.easypanel.host/`
4. **Admin panel accessible** - `https://riostack-indigo-studio.ck87nu.easypanel.host/manage/admin`

## 🧪 Test Endpoints

After deployment, test these:

- **Root**: `https://riostack-indigo-studio.ck87nu.easypanel.host/`
- **Admin**: `https://riostack-indigo-studio.ck87nu.easypanel.host/manage/admin`
- **API**: `https://riostack-indigo-studio.ck87nu.easypanel.host/api/articles`

## 🔧 Troubleshooting

If you still get 502 errors:

1. **Check Easypanel logs** - Look for "Missing admin.auth.secret" errors
2. **Verify environment variables** - Make sure all 15 variables are set
3. **Restart service** - Sometimes a full restart is needed
4. **Check build logs** - Ensure the latest commit (5b45a2a) is being used

## 📊 Current Status

- ✅ **Dockerfile**: Fixed with proper secrets
- ✅ **GitHub Integration**: Working (auto-deploys)
- ❌ **Environment Variables**: Need manual configuration
- ✅ **Health Check**: Configured and ready
- ✅ **Volume Mounts**: Configured for data persistence

**One-time manual setup is required** to add the environment variables, after which it will work smoothly!