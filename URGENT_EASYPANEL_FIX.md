# 🚨 URGENT: Easypanel SSH Configuration Fix

## Current Status
- **Deployment URL**: https://riostack-indigo-studio.ck87nu.easypanel.host/
- **Status**: 503 Service Unavailable (Containers failing to build)
- **Root Cause**: SSH connection failure between Easypanel and GitHub

## The Problem
Easypanel cannot access the GitHub repository because:
1. Repository URL is using HTTPS instead of SSH format
2. SSH key is truncated (shows `...` at the end)
3. This prevents Docker from pulling the code during deployment

## 🎯 EXACT STEPS TO FIX (Do These Now)

### Step 1: Update GitHub Deploy Key
1. Go to: https://github.com/indigo-services/indigo-studio/settings/keys
2. Click "Add deploy key"
3. Title: `Easypanel-Production-Server`
4. Key: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFK+h9uzv6xOy0pFVn2ecJhevb7j8aZ69sANxWDfWH1D easypanel@riostack`
5. ✅ **CHECK "Allow write access"** (this is critical!)
6. Click "Add deploy key"

### Step 2: Update Easypanel Configuration
1. Go to: https://vps10.riolabs.ai
2. Navigate to: Compose Apps → indigo-studio
3. Click "Edit" button

#### Change Repository URL:
- **From**: `https://github.com/indigo-services/indigo-studio`
- **To**: `git@github.com:indigo-services/indigo-studio.git`

#### Replace SSH Key:
Delete the existing truncated key and paste this **complete** key:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9QwAAAJjKCPLfygjy
3wAAAAtzc2gtZWQyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9Qw
AAAEBkD0kLTT90KjR2copz2nUAYWzOCiQMS6E1EMzZrtQ6rVK+h9uzv6xOy0pFVn2ecJhe
vb7j8aZ69sANxWDfWH1DAAAAEmVhc3lwYW5lbEByaW9zdGFjawECAw==
-----END OPENSSH PRIVATE KEY-----
```

#### Verify Other Settings:
- Branch: `main`
- Build Path: `/`
- Docker Compose File: `docker-compose.yml`

### Step 3: Deploy
1. Click "Save" button
2. Click "Deploy" button
3. Wait 2-3 minutes for containers to build

### Step 4: Verify Success
The monitoring script running in the background will automatically detect when deployment is successful. You should see:
- ✅ Main endpoint: https://riostack-indigo-studio.ck87nu.easypanel.host/
- ✅ Admin panel: https://riostack-indigo-studio.ck87nu.easypanel.host/manage/admin
- ✅ API endpoint: https://riostack-indigo-studio.ck87nu.easypanel.host/api/articles

## 🔍 Monitoring Progress
The monitoring script is actively checking endpoints and will report when deployment succeeds. Look for output showing all endpoints returning 200 OK.

## ❓ Why This Matters
- SSH keys allow Easypanel to securely pull code from GitHub
- Complete keys (not truncated) are required for authentication
- SSH format URLs are required for key-based authentication
- Without this, deployment cannot proceed and containers will fail to build

## 🚀 Expected Outcome
Once these changes are applied:
1. SSH connection will work
2. Easypanel will successfully pull from GitHub
3. Docker containers will build successfully
4. All endpoints will return 200 OK
5. Admin panel will be accessible
6. Deployment will be fully functional

---

**This is the critical fix needed to complete the deployment. Please apply these changes now.**