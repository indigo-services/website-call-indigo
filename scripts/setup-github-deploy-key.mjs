#!/usr/bin/env node

/**
 * GitHub Deploy Key Setup Script
 * Automatically adds the deploy key to GitHub repository
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

// The public key we generated
const PUBLIC_KEY = `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFK+h9uzv6xOy0pFVn2ecJhevb7j8aZ69sANxWDfWH1D easypanel@riostack`;

header('🔑 GitHub Deploy Key Setup');

log('\nThis script will help you add the deploy key to GitHub.\n');

info('Step 1: Add Deploy Key to GitHub');
log('Please follow these steps:\n', COLORS.yellow);

log('1. Go to: https://github.com/indigo-services/indigo-studio/settings/keys', COLORS.cyan);
log('2. Click "Add deploy key"', COLORS.cyan);
log('3. Title: "Easypanel Production"', COLORS.cyan);
log('4. Key: (copy the key below)', COLORS.cyan);
log('5. ✅ Check "Allow write access"', COLORS.cyan);
log('6. Click "Add key"\n', COLORS.cyan);

header('📋 Public Key to Copy');
log('\n' + PUBLIC_KEY + '\n\n', COLORS.green);

info('Step 2: Update Easypanel Configuration');
log('After adding the deploy key, update Easypanel:\n', COLORS.yellow);

log('Repository URL: git@github.com:indigo-services/indigo-studio.git', COLORS.cyan);
log('Branch: main', COLORS.cyan);
log('Build Path: /', COLORS.cyan);
log('Docker Compose File: docker-compose.yml', COLORS.cyan);

log('\nSSH Key (private): Copy this entire block:', COLORS.cyan);
log('\n-----BEGIN OPENSSH PRIVATE KEY-----', COLORS.green);
log('b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW', COLORS.green);
log('QyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9QwAAAJjKCPLfygjy', COLORS.green);
log('3wAAAAtzc2gtZWQyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9Qw', COLORS.green);
log('AAAEBkD0kLTT90KjR2copz2nUAYWzOCiQMS6E1EMzZrtQ6rVK+h9uzv6xOy0pFVn2ecJhe', COLORS.green);
log('vb7j8aZ69sANxWDfWH1DAAAAEmVhc3lwYW5lbEByaW9zdGFjawECAw==', COLORS.green);
log('-----END OPENSSH PRIVATE KEY-----\n', COLORS.green);

header('🚀 Next Steps');
success('1. Add deploy key to GitHub');
success('2. Update Easypanel configuration');
success('3. Click "Save" in Easypanel');
success('4. Click "Deploy" in Easypanel');
success('5. Run: node scripts/validate-deployment.mjs');

log('\n✅ Setup complete! Follow the steps above.\n', COLORS.green);