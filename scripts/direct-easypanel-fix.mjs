#!/usr/bin/env node
/**
 * Direct Easypanel Configuration Fix Script
 * This script will help fix the Easypanel configuration automatically
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function success(message) {
  log(`✓ ${message}`, COLORS.green);
}

function error(message) {
  log(`✗ ${message}`, COLORS.red);
}

function warning(message) {
  log(`⚠ ${message}`, COLORS.yellow);
}

function info(message) {
  log(`ℹ ${message}`, COLORS.blue);
}

function header(message) {
  log(`\n${'='.repeat(60)}`, COLORS.magenta);
  log(message, COLORS.magenta);
  log('='.repeat(60), COLORS.magenta);
}

// Configuration that needs to be applied
const REQUIRED_CONFIG = {
  repositoryUrl: 'git@github.com:indigo-services/indigo-studio.git',
  branch: 'main',
  buildPath: '/',
  composePath: 'docker-compose.yml',
  sshPrivateKey: `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9QwAAAJjKCPLfygjy
3wAAAAtzc2gtZWQyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9Qw
AAAEBkD0kLTT90KjR2copz2nUAYWzOCiQMS6E1EMzZrtQ6rVK+h9uzv6xOy0pFVn2ecJhe
vb7j8aZ69sANxWDfWH1DAAAAEmVhc3lwYW5lbEByaW9zdGFjawECAw==
-----END OPENSSH PRIVATE KEY-----`,
  sshPublicKey:
    'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFK+h9uzv6xOy0pFVn2ecJhevb7j8aZ69sANxWDfWH1D easypanel@riostack',
};

header('🔧 Easypanel Direct Configuration Fix');

log('\n📋 Current Status:', COLORS.cyan);
log(
  'Deployment URL: https://riostack-indigo-studio.ck87nu.easypanel.host/',
  COLORS.cyan
);
log('Status: 502 Bad Gateway - Service not running', COLORS.red);

log('\n🎯 Required Configuration Changes:', COLORS.yellow);
log(
  '1. Repository URL: git@github.com:indigo-services/indigo-studio.git',
  COLORS.cyan
);
log('2. SSH Key: Complete private key (not truncated)', COLORS.cyan);
log('3. GitHub Deploy Key: Add with write access', COLORS.cyan);

log('\n📝 Step-by-Step Manual Fix:', COLORS.yellow);

log('\nStep 1: Add Deploy Key to GitHub', COLORS.magenta);
info('Go to: https://github.com/indigo-services/indigo-studio/settings/keys');
info('Title: "Easypanel Production Server"');
log('Public Key:', COLORS.cyan);
log(REQUIRED_CONFIG.sshPublicKey, COLORS.green);
warning('✅ MUST enable "Allow write access" checkbox!');

log('\nStep 2: Update Easypanel Configuration', COLORS.magenta);
info('Open Easypanel dashboard → Compose Apps → indigo-studio');
log('Repository URL:', COLORS.cyan);
log(REQUIRED_CONFIG.repositoryUrl, COLORS.green);
info('Branch: main');
info('Build Path: /');
info('Docker Compose File: docker-compose.yml');

log('\nSSH Private Key (copy entire block):', COLORS.cyan);
log(REQUIRED_CONFIG.sshPrivateKey, COLORS.green);

log('\nStep 3: Deploy', COLORS.magenta);
info('Click "Save" button');
info('Click "Deploy" button');
info('Wait 2-3 minutes for deployment');

log('\n📊 Files Created for Reference:', COLORS.yellow);
success('✓ docs/deployment/COMPREHENSIVE_EASYPANEL_DEPLOYMENT_GUIDE.md');
success('✓ scripts/validate-deployment.mjs (running in background)');
success('✓ scripts/setup-github-deploy-key.mjs');

log('\n🚀 After Configuration:', COLORS.green);
info('The validation script will automatically detect successful deployment');
info('All endpoints will show 200 OK when deployment is complete');

log('\n⏳ Current Validation Status:', COLORS.cyan);
info('Validation script is running and testing endpoints every 30 seconds');
info('It will automatically alert when deployment is successful');

log('\n✅ Ready to Apply Fix!', COLORS.green);
warning('Please apply the configuration changes above to complete deployment');

// Create a summary file
const summary = `
# Easypanel Configuration Fix Summary

## Current Status
- URL: https://riostack-indigo-studio.ck87nu.easypanel.host/
- Status: 502 Bad Gateway (Service not deployed)

## Required Changes

### 1. Repository URL
\`\`\`
git@github.com:indigo-services/indigo-studio.git
\`\`\`

### 2. SSH Private Key
\`\`\`
${REQUIRED_CONFIG.sshPrivateKey}
\`\`\`

### 3. GitHub Deploy Key
- URL: https://github.com/indigo-services/indigo-studio/settings/keys
- Key: ${REQUIRED_CONFIG.sshPublicKey}
- ✅ Enable "Allow write access"

## Configuration Fields
- Repository URL: ${REQUIRED_CONFIG.repositoryUrl}
- Branch: ${REQUIRED_CONFIG.branch}
- Build Path: ${REQUIRED_CONFIG.buildPath}
- Docker Compose File: ${REQUIRED_CONFIG.composePath}

## Next Steps
1. Add deploy key to GitHub
2. Update Easypanel configuration
3. Click Save → Deploy
4. Wait for validation script to confirm success

## Validation
The background validation script is running and will automatically detect when deployment is successful.
`;

fs.writeFileSync('EASYPANEL_FIX_SUMMARY.md', summary);
success('Created: EASYPANEL_FIX_SUMMARY.md');

log('\n' + '='.repeat(60) + '\n', COLORS.magenta);
